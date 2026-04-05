/**
 * Authentication Utility
 * Handles JWT token management, API calls, and auth state
 */

import { API_BASE } from './api-config';

class AuthService {
  constructor() {
    this.tokenKey = 'pace_auth_token';
    this.userKey = 'pace_user_data';
  }

  /**
   * Login user
   */
  async login(username, password) {
    // MOCK LOGIN: Allow any credentials
    const dummyUser = {
      id: 1,
      username: username || 'admin',
      name: 'System Administrator',
      type: 'admin',
      phone: '0712345678',
      email: 'admin@pacewisp.co.ke'
    }
    const dummyToken = 'mock-jwt-token-' + Date.now();
    
    this.setToken(dummyToken);
    this.setUser(dummyUser);
    
    return { 
      success: true, 
      data: { 
        token: dummyToken, 
        user: dummyUser 
      } 
    };
  }

  /**
   * Logout user
   */
  async logout() {
    const token = this.getToken();

    // Fire and forget logout request - don't block UI
    if (token) {
      fetch(`${API_BASE}/auth.php?action=logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(error => console.error('Logout error:', error));
    }

    // Immediately clear local auth
    this.clearAuth();
  }

  /**
   * Verify token validity
   */
  async verifyToken() {
    return true; // Always valid in mock mode
  }

  /**
   * Refresh expired token
   */
  async refreshToken() {
    return true; // Always success in mock mode
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!(token && !this.isTokenExpired(token));
  }

  /**
   * Get current user data
   */
  getUser() {
    if (typeof window === 'undefined') return null;

    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get auth token
   */
  getToken() {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set auth token
   */
  setToken(token) {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Set user data
   */
  setUser(user) {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.userKey, JSON.stringify(user));
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
   * Make authenticated API request
   */
  async authenticatedFetch(url, options = {}) {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.getToken() || 'mock-token'}`,
    };
    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Decode JWT token (client-side only for reading payload)
   */
  decodeToken(token) {
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
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired (client-side check)
   */
  isTokenExpired(token) {
    if (!token) return true;
    
    // Support mock tokens that don't have exp claims
    if (token.startsWith('mock-')) {
      return false;
    }

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return false; // If we can't tell it's expired, assume it's not (for safety in mock modes)
    }
    return decoded.exp < Date.now() / 1000;
  }

  /**
   * Get user profile info
   */
  async getProfile() {
    try {
      const response = await this.authenticatedFetch(`${API_BASE}/user_profile.php`, {
        method: 'GET',
      });
      const data = await response.json();
      if (data.status === 'success') {
        // Update stored user data if it changed
        this.setUser({ ...this.getUser(), ...data.data });
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Failed to fetch profile' };
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update user profile info
   */
  async updateProfile(profileData) {
    try {
      const response = await this.authenticatedFetch(`${API_BASE}/user_profile.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (data.status === 'success') {
        // If name or phone changed, update stored user info
        if (profileData.name || profileData.phone) {
          const currentUser = this.getUser();
          this.setUser({
            ...currentUser,
            name: profileData.name || currentUser.name,
            phone: profileData.phone || currentUser.phone
          });
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to update profile' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message };
    }
  }
}

export const authService = new AuthService();
export default authService;
