/**
 * Authentication Utility (Sovereign Mock Hub)
 * Handles local state management and session persistence without external API calls.
 */

class AuthService {
  constructor() {
    this.tokenKey = 'pace_auth_token';
    this.userKey = 'pace_user_data';
  }

  /**
   * Login user (Mock)
   */
  async login(username, password) {
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
   * Logout user (Mock)
   */
  async logout() {
    // Immediately clear local auth without attempting network handshake
    this.clearAuth();
  }

  /**
   * Verify token validity
   */
  async verifyToken() {
    return true; 
  }

  /**
   * Refresh expired token
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
   * Mock authenticated request (No-op)
   */
  async authenticatedFetch(url, options = {}) {
    return { ok: true, json: async () => ({ status: 'success', data: {} }) };
  }

  /**
   * Decode JWT token payload (Mock)
   */
  decodeToken(token) {
    return { exp: Date.now() / 1000 + 3600 };
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token) {
    if (!token) return true;
    return false; // Mock tokens never expire in this portal
  }

  /**
   * Get user profile info (Mock)
   */
  async getProfile() {
    return { success: true, data: this.getUser() };
  }

  /**
   * Update user profile info (Mock)
   */
  async updateProfile(profileData) {
    const currentUser = this.getUser();
    const updatedUser = { ...currentUser, ...profileData };
    this.setUser(updatedUser);
    return { success: true, message: 'Profile updated locally.' };
  }

  /**
   * Check if user has a specific policy
   * Admins and Superadmins have all policies by default.
   */
  hasPolicy(policy) {
    if (typeof window === 'undefined') return false;
    const user = this.getUser();
    if (!user) return false;

    // Admin/Superadmin bypass
    if (user.type === 'admin' || user.type === 'superadmin') return true;

    // Check specific policy
    const policies = user.policies || [];
    return policies.includes(policy);
  }
}

export const authService = new AuthService();
export default authService;
