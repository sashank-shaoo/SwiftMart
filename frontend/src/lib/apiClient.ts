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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `API Error: ${response.status}`;

      // Global Error Handler
      globalNotify("error", errorMessage);

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (err: any) {
    if (err.message === "Failed to fetch") {
      globalNotify("error", "Network error: Backend unreachable");
    }
    throw err;
  }
}
