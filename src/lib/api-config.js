/**
 * API Configuration Utility
 * Exports the API URL from environment variables.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/pace.com/pace-apis/dashboard/v1';

export const getApiUrl = () => API_BASE;

export default getApiUrl;
