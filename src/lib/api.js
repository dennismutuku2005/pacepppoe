/**
 * Centralized API Fetch client
 * Automatically appends the base API URL, handles JWT bearer tokens,
 * and processes standard authorization failures (401 Unauthorized).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/pace.com/pppoe/apis/v1';

export async function apiFetch(endpoint, options = {}) {
  // Clean slash mapping
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  // Default headers
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  // Automatically append content-type if body is provided and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Inject JWT bearer token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pace_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Auto-logout on 401 Unauthorized (except for login requests)
    if (response.status === 401 && !cleanEndpoint.includes('/auth/login.php')) {
        try {
          localStorage.removeItem('pace_auth_token');
          localStorage.removeItem('pace_user_data');
          localStorage.removeItem('pace_session_last_active');
          sessionStorage.clear();
        } catch (e) {}

        const isHttps = window.location.protocol === 'https:';
        const domain = window.location.hostname;
        const domainParts = domain ? domain.split('.') : [];
        const domainsToClear = ['', domain, `.${domain}`];
        for (let i = 0; i < domainParts.length; i++) {
          const d = domainParts.slice(i).join('.');
          if (d) domainsToClear.push(d, `.${d}`);
        }
        const uniqueDomains = Array.from(new Set(domainsToClear));

        const targetCookies = ['pace_auth_token', 'pace_user_data', 'pace_session_last_active'];
        try {
          document.cookie.split(';').forEach((cookieStr) => {
            const eqPos = cookieStr.indexOf('=');
            const name = eqPos > -1 ? cookieStr.substring(0, eqPos).trim() : cookieStr.trim();
            if (name && !targetCookies.includes(name)) targetCookies.push(name);
          });
        } catch (e) {}

        targetCookies.forEach((name) => {
          uniqueDomains.forEach((dom) => {
            const domAttr = dom ? `;domain=${dom}` : '';
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;max-age=0${domAttr}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;max-age=0;SameSite=Lax${domAttr}${isHttps ? ';Secure' : ''}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;max-age=0;SameSite=None${domAttr}${isHttps ? ';Secure' : ''}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=;max-age=0${domAttr}`;
          });
        });

        // Redirect to login page
        window.location.href = '/login';
        throw new Error('Unauthorized session. Please login again.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}
