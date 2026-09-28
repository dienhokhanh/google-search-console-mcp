import { describe, expect, it } from "vitest";

import { formatGoogleApiError } from "../../src/google/api-error.js";

describe("formatGoogleApiError", () => {
  it("adds actionable guidance for permission errors", () => {
    const error = Object.assign(new Error("Forbidden"), {
      response: { status: 403, data: { error: { message: "User does not have access." } } },
    });

    expect(formatGoogleApiError(error)).toContain(
      "Confirm that the authenticated identity has access",
    );
  });

  it("does not serialize request credentials", () => {
    const error = Object.assign(new Error("Request failed"), {
      config: { headers: { Authorization: "Bearer secret-token" } },
      response: { status: 500, data: { error: { message: "Internal error" } } },
    });

    expect(formatGoogleApiError(error)).not.toContain("secret-token");
  });
});
