// Central API configuration
// In development, this points to localhost.
// In production, it uses VITE_API_URL from environment or defaults to the same domain (relative path).
const API_BASE = import.meta.env?.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:5000' 
    : '');

export default API_BASE;
