export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

export const getApiAssetUrl = (url) => (
  url.startsWith('/') ? `${API_BASE_URL}${url}` : url
);
