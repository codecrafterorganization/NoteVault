// Central API configuration
const API_BASE = import.meta.env?.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:5000' 
    : 'https://notevault-backend-2q2d.onrender.com');

export default API_BASE;
