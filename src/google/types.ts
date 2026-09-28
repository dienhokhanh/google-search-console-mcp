export type PermissionLevel =
  "siteOwner" | "siteFullUser" | "siteRestrictedUser" | "siteUnverifiedUser";

export interface SiteEntry {
  siteUrl: string;
  permissionLevel: PermissionLevel | string;
}

export interface SitesListResponse {
  siteEntry?: SiteEntry[];
}

export interface SearchAnalyticsFilter {
  dimension: "country" | "device" | "page" | "query" | "searchAppearance";
  operator?:
    "contains" | "equals" | "notContains" | "notEquals" | "includingRegex" | "excludingRegex";
  expression: string;
}

export interface SearchAnalyticsRequest {
  startDate: string;
  endDate: string;
  dimensions?: Array<
    "country" | "device" | "page" | "query" | "searchAppearance" | "date" | "hour"
  >;
  type?: "web" | "image" | "video" | "news" | "discover" | "googleNews";
  dimensionFilterGroups?: Array<{
    groupType?: "and";
    filters: SearchAnalyticsFilter[];
  }>;
  aggregationType?: "auto" | "byPage" | "byProperty" | "byNewsShowcasePanel";
  dataState?: "final" | "all" | "hourly_all";
  rowLimit?: number;
  startRow?: number;
}

export interface SearchAnalyticsRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

export interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
  responseAggregationType?: string;
  metadata?: {
    firstIncompleteDate?: string;
    firstIncompleteHour?: string;
  };
}

export interface SitemapContent {
  type?: string;
  submitted?: number;
  indexed?: number;
}

export interface SitemapEntry {
  path?: string;
  lastSubmitted?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  type?: string;
  lastDownloaded?: string;
  warnings?: string;
  errors?: string;
  contents?: SitemapContent[];
}

export interface SitemapsListResponse {
  sitemap?: SitemapEntry[];
}

export interface UrlInspectionResponse {
  inspectionResult?: Record<string, unknown>;
}
