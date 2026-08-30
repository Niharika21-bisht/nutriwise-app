/**
 * Google Authentication & Identity Service for NutriWise
 */

// Helper to decode standard Google JWT Credential Token
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return null;
  }
}

// Generate fallback avatar URL from name/email if none provided
export function generateAvatarUrl(name, email) {
  const identifier = name || email || 'User';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(identifier)}&backgroundColor=059669,0d9488,0284c7&textColor=ffffff`;
}

// Default Google Client ID placeholder (can be customized by user or environment)
export const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
