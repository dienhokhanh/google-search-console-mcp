interface ErrorResponseLike {
  status?: number;
  data?: unknown;
}

interface GoogleErrorLike extends Error {
  code?: string | number;
  response?: ErrorResponseLike;
}

function isGoogleErrorLike(value: unknown): value is GoogleErrorLike {
  return value instanceof Error;
}

function extractApiMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return undefined;
  }

  const error = (data as { error?: unknown }).error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}

export function formatGoogleApiError(error: unknown): string {
  if (!isGoogleErrorLike(error)) {
    return `Unexpected error: ${String(error)}`;
  }

  const status = error.response?.status ?? error.code;
  const apiMessage = extractApiMessage(error.response?.data);
  const message = apiMessage ?? error.message;
  const prefix = status
    ? `Google Search Console API error (${String(status)})`
    : "Google Search Console API error";

  if (status === 401) {
    return `${prefix}: authentication failed. Check the configured Google credentials. ${message}`;
  }

  if (status === 403) {
    return `${prefix}: access denied. Confirm that the authenticated identity has access to the Search Console property. ${message}`;
  }

  if (status === 429) {
    return `${prefix}: quota exceeded. Wait before retrying or review the project's Search Console API quota. ${message}`;
  }

  return `${prefix}: ${message}`;
}
