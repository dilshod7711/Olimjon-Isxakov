export const CONFIG = {
  videoId: 'QMcylU5ZCLE',
  leadEndpoint:
    typeof window !== 'undefined' && window.location.protocol === 'file:' ? '' : '/api/lead',
};

export const STORAGE_KEY = 'olimjon-lead';

export function getStoredLead() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveLead(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

export function formatPhone(d) {
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)]
    .filter(Boolean)
    .join(' ');
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
