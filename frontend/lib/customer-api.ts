import Cookies from "js-cookie";

/**
 * Customer Backend API helper.
 * Points to the Customer_Backend Django server (default port 8001).
 * Separate from the organiser backend at port 8000.
 */
const CUSTOMER_API =
  process.env.NEXT_PUBLIC_CUSTOMER_API_URL || "http://localhost:8001/api";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function customerApi(
  endpoint: string,
  options: FetchOptions = {}
) {
  const { requireAuth = false, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");

  if (requireAuth) {
    let token = Cookies.get("access_token");
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("access_token")?.value;
    }
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = `${CUSTOMER_API}${endpoint}`;

  const response = await fetch(url, {
    headers: requestHeaders,
    cache: "no-store",
    ...rest,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      import("js-cookie").then((Cookies) => {
        Cookies.default.remove("access_token");
        window.location.href = "/login";
      });
    }

    const err: any = new Error(
      data.detail || data.message || `API Error: ${response.status}`
    );
    err.status = response.status;
    err.code = data.code;
    err.data = data;
    throw err;
  }

  return data;
}
