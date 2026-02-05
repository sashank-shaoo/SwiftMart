import { globalNotify } from "@/context/NotificationContext";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(options.headers || {}).map(([k, v]) => [k, String(v)]),
    ),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Required for cookie handling
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || (result && result.success === false)) {
      // Extract the most descriptive error message
      let errorMessage =
        result.message ||
        result.error ||
        (Array.isArray(result.details)
          ? "Validation failed"
          : `API Error: ${response.status}`);

      // If it's a validation error with details, append them for better UX
      if (result.details && Array.isArray(result.details)) {
        const detailsText = result.details
          .map((d: any) => `${d.field ? `${d.field}: ` : ""}${d.message}`)
          .join(", ");
        if (detailsText) {
          errorMessage = `${errorMessage} (${detailsText})`;
        }
      }

      // Global Error Handler
      globalNotify("error", errorMessage);

      const error = new Error(errorMessage) as any;
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result.success ? result.data : result;
  } catch (err: any) {
    // Only notify if we haven't already (api errors are handled above)
    if (err.message === "Failed to fetch") {
      globalNotify("error", "Network error: Backend unreachable");
    }
    throw err;
  }
}
