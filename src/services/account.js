/**
 * Account Service (Mock)
 */
export const accountService = {
  async getAccountDetails() {
    return {
      status: 'success',
      data: {
        id: 'ACC-842C-B1F0',
        license: 'Enterprise Gateway',
        status: 'Active',
        expiry: '2026-12-31'
      }
    };
  },

  async updateAccount(data) {
    return { status: 'success', message: 'Account synchronized.' };
  }
};
