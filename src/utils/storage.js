/**
 * Persistence layer for Data Broker Removal Agent.
 * Uses localStorage to store progress, notes, and user profile data.
 */

const STORAGE_KEY = 'antigravity_dbr_state';

export const saveState = (state) => {
  try {
    const dataToSave = {
      progress: state.progress || {},
      notes: state.notes || {},
      userInfo: state.userInfo || { fullName: '', email: '', phone: '', address: '' },
      activityLog: (state.activityLog || []).slice(-100) // Keep last 100 actions
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
};

export const clearState = () => {
  localStorage.removeItem(STORAGE_KEY);
};
