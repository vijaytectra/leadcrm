// Helper function to get token from cookies on client side
export function getClientToken(): string | null {
  if (typeof document === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");

    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );

    if (tokenCookie) {
      const token = tokenCookie.split("=")[1];
      const decodedToken = token ? decodeURIComponent(token) : null;
      return decodedToken;
    }

    return null;
  } catch (error) {
    console.error("Error getting client token:", error);
    return null;
  }
}
