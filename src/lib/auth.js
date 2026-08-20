/**
 * Authentication Utility
 * Connects with PHP JWT Auth APIs and manages session storage.
 */
import { apiFetch } from './api';

class AuthService {
  constructor() {
    this.tokenKey = 'pace_auth_token';
    this.userKey = 'pace_user_data';
  }

  /**
   * Login user via backend API
   */
  async login(username, password) {
    if (!username || !password) {
      return {
        success: false,
        message: 'Username and password are required.'
      };
    }

    try {
      const res = await apiFetch('/auth/login.php', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (res && res.status === 'success') {
        const token = res.data.token;
        const user = {
          id: res.data.user.id,
          username: res.data.user.username,
          name: res.data.user.name,
          type: res.data.user.role // role maps to type (admin or isp)
        };

        this.setToken(token);
        this.setUser(user);

        return {
          success: true,
          data: {
            token,
            user
          }
        };
      } else {
        return {
          success: false,
          message: res.message || 'Invalid credentials.'
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Connection failure.'
      };
    }
  }

  /**
   * Logout user via backend API and clear local state
   */
  async logout() {
    try {
      await apiFetch('/auth/logout.php', { method: 'POST' });
    } catch (err) {
      console.warn("Logout endpoint failed:", err);
    } finally {
      this.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Verify token validity
   */
  async verifyToken() {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return false;
    }
    return true;
  }

  /**
   * Refresh expired token (Mocked/No-op as backend handles standard JWTs)
   */
  async refreshToken() {
    return true;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!(token && !this.isTokenExpired(token));
  }

  /**
   * Get current cached user data
   */
  getUser() {
    if (typeof window === 'undefined') return null;
    let userData = localStorage.getItem(this.userKey);
    if (!userData) {
      const match = document.cookie.match(new RegExp('(^| )' + this.userKey + '=([^;]+)'));
      if (match) {
        try {
          userData = decodeURIComponent(match[2]);
        } catch (e) {
          userData = null;
        }
      }
    }
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get auth token
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    let token = localStorage.getItem(this.tokenKey);
    if (!token) {
      const match = document.cookie.match(new RegExp('(^| )' + this.tokenKey + '=([^;]+)'));
      if (match) token = match[2];
    }
    return token;
  }

  /**
   * Set auth token
   */
  setToken(token) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
    document.cookie = `${this.tokenKey}=${token};path=/;max-age=86400;SameSite=Lax;Secure`;
  }

  /**
   * Set user data
   */
  setUser(user) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.userKey, JSON.stringify(user));
    document.cookie = `${this.userKey}=${encodeURIComponent(JSON.stringify(user))};path=/;max-age=86400;SameSite=Lax;Secure`;
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });
  }

  /**
   * Authenticated request helper
   */
  async authenticatedFetch(url, options = {}) {
    return apiFetch(url, options);
  }

  /**
   * Decode JWT token payload
   */
  decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload;
    } catch (e) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token) {
    if (!token) return true;
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp < Date.now() / 1000;
  }

  /**
   * Get user profile info from backend
   */
  async getProfile() {
    try {
      const res = await apiFetch('/auth/me.php');
      if (res && res.status === 'success') {
        const user = {
          id: res.data.id,
          username: res.data.username,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          type: res.data.role
        };
        this.setUser(user);
        return { success: true, data: user };
      }
      return { success: false, message: 'Failed to retrieve profile.' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  /**
   * Update user profile info (Mock/Local fallback)
   */
  async updateProfile(profileData) {
    const currentUser = this.getUser();
    const updatedUser = { ...currentUser, ...profileData };
    this.setUser(updatedUser);
    return { success: true, message: 'Profile updated locally.' };
  }

  /**
   * Check if user has a specific policy
   */
  hasPolicy(policy) {
    if (typeof window === 'undefined') return false;
    const user = this.getUser();
    return !!user;
  }
}

export const authService = new AuthService();
export default authService;
