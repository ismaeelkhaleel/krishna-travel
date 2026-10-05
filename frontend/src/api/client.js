const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (response.status === 403) {
      window.dispatchEvent(new CustomEvent('access-denied'));
      throw new Error('ACCESS_DENIED');
    }

    if (!response.ok) {
      if (response.status === 409) {
        // Special case for duplicates, pass data to UI
        const error = new Error('DUPLICATE');
        error.data = data.data;
        error.reason = data.reason;
        error.originalMessage = data.message;
        throw error;
      }
      if (response.status === 400 && data.errors) {
         // Validation error
         const err = new Error('VALIDATION_ERROR');
         err.errors = data.errors;
         throw err;
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
