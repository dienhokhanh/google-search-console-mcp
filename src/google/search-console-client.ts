import { GoogleAuth } from "google-auth-library";

import type { AppConfig } from "../config/types.js";
import type { Logger } from "../shared/logger.js";
import { PACKAGE_NAME, PACKAGE_VERSION } from "../version.js";
import type {
  SearchAnalyticsRequest,
  SearchAnalyticsResponse,
  SitemapEntry,
  SitemapsListResponse,
  SiteEntry,
  SitesListResponse,
  UrlInspectionResponse,
} from "./types.js";

const WEBMASTERS_BASE_URL = "https://www.googleapis.com/webmasters/v3";
const INSPECTION_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const READONLY_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const WRITE_SCOPE = "https://www.googleapis.com/auth/webmasters";

export interface RequestOptions {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: object;
  timeout?: number;
  retry?: boolean;
  retryConfig?: {
    retry: number;
    httpMethodsToRetry: string[];
    statusCodesToRetry: number[][];
  };
  headers?: Record<string, string>;
}

export interface AuthenticatedRequester {
  request<T>(options: RequestOptions): Promise<{ data: T }>;
}

export interface SearchConsoleClientOptions {
  config: AppConfig;
  logger: Logger;
  requester?: AuthenticatedRequester;
}

export class SearchConsoleClient {
  readonly #config: AppConfig;
  readonly #logger: Logger;
  readonly #requester: AuthenticatedRequester;

  constructor(options: SearchConsoleClientOptions) {
    this.#config = options.config;
    this.#logger = options.logger;

    if (options.requester) {
      this.#requester = options.requester;
    } else {
      const auth = new GoogleAuth({
        ...(options.config.credentialsFile ? { keyFile: options.config.credentialsFile } : {}),
        scopes: [options.config.enableWriteTools ? WRITE_SCOPE : READONLY_SCOPE],
      });
      this.#requester = auth;
    }
  }

  async listSites(): Promise<SiteEntry[]> {
    const response = await this.#request<SitesListResponse>(`${WEBMASTERS_BASE_URL}/sites`, "GET");
    const sites = response.siteEntry ?? [];

    if (this.#config.allowedSites.size === 0) {
      return sites;
    }

    return sites.filter((site) => this.#config.allowedSites.has(site.siteUrl));
  }

  async getSite(siteUrl: string): Promise<SiteEntry> {
    this.#assertSiteAllowed(siteUrl);
    return this.#request<SiteEntry>(
      `${WEBMASTERS_BASE_URL}/sites/${encodeURIComponent(siteUrl)}`,
      "GET",
    );
  }

  async querySearchAnalytics(
    siteUrl: string,
    query: SearchAnalyticsRequest,
  ): Promise<SearchAnalyticsResponse> {
    this.#assertSiteAllowed(siteUrl);
    const requestedLimit = query.rowLimit ?? 1_000;
    const body = {
      ...query,
      rowLimit: Math.min(requestedLimit, this.#config.maxAnalyticsRows),
    };

    return this.#request<SearchAnalyticsResponse>(
      `${WEBMASTERS_BASE_URL}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      "POST",
      body,
    );
  }

  async listSitemaps(siteUrl: string, sitemapIndex?: string): Promise<SitemapEntry[]> {
    this.#assertSiteAllowed(siteUrl);
    const url = new URL(`${WEBMASTERS_BASE_URL}/sites/${encodeURIComponent(siteUrl)}/sitemaps`);
    if (sitemapIndex) {
      url.searchParams.set("sitemapIndex", sitemapIndex);
    }

    const response = await this.#request<SitemapsListResponse>(url.toString(), "GET");
    return response.sitemap ?? [];
  }

  async getSitemap(siteUrl: string, sitemapUrl: string): Promise<SitemapEntry> {
    this.#assertSiteAllowed(siteUrl);
    return this.#request<SitemapEntry>(
      `${WEBMASTERS_BASE_URL}/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
      "GET",
    );
  }

  async submitSitemap(siteUrl: string, sitemapUrl: string): Promise<void> {
    this.#assertWriteEnabled();
    this.#assertSiteAllowed(siteUrl);
    await this.#request<unknown>(
      `${WEBMASTERS_BASE_URL}/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
      "PUT",
    );
  }

  async deleteSitemap(siteUrl: string, sitemapUrl: string): Promise<void> {
    this.#assertWriteEnabled();
    this.#assertSiteAllowed(siteUrl);
    await this.#request<unknown>(
      `${WEBMASTERS_BASE_URL}/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
      "DELETE",
    );
  }

  async inspectUrl(
    siteUrl: string,
    inspectionUrl: string,
    languageCode?: string,
  ): Promise<UrlInspectionResponse> {
    this.#assertSiteAllowed(siteUrl);
    return this.#request<UrlInspectionResponse>(INSPECTION_URL, "POST", {
      siteUrl,
      inspectionUrl,
      ...(languageCode ? { languageCode } : {}),
    });
  }

  #assertSiteAllowed(siteUrl: string): void {
    if (this.#config.allowedSites.size > 0 && !this.#config.allowedSites.has(siteUrl)) {
      throw new Error(
        `Access to Search Console property "${siteUrl}" is not allowed by GSC_ALLOWED_SITES.`,
      );
    }
  }

  #assertWriteEnabled(): void {
    if (!this.#config.enableWriteTools) {
      throw new Error("Write tools are disabled. Set GSC_ENABLE_WRITE_TOOLS=true to enable them.");
    }
  }

  async #request<T>(url: string, method: RequestOptions["method"], data?: object): Promise<T> {
    this.#logger.debug("Calling Google Search Console API", { method, url });
    const response = await this.#requester.request<T>({
      url,
      method,
      ...(data ? { data } : {}),
      timeout: this.#config.requestTimeoutMs,
      retry: this.#config.maxRetries > 0,
      retryConfig: {
        retry: this.#config.maxRetries,
        httpMethodsToRetry: ["GET", "POST", "PUT", "DELETE"],
        statusCodesToRetry: [
          [408, 408],
          [429, 429],
          [500, 599],
        ],
      },
      headers: {
        "User-Agent": `${PACKAGE_NAME}/${PACKAGE_VERSION}`,
      },
    });
    return response.data;
  }
}
