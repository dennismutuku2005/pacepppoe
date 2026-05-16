/**
 * System Service (Mock)
 */
export const systemService = {
  async getSettings() {
    return {
      status: 'success',
      data: {
        receive_error_info: 1,
        maintenance_mode: 0,
        debug_logs: 1,
        auto_update: 0
      }
    };
  },

  async updateSettings(settings) {
    return { status: 'success', message: 'System parameters updated.' };
  }
};
