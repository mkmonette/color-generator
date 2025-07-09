const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_BASE_URL must be defined');
}

export async function findById(id) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('findById: "id" must be a non-empty string');
  }
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET'
    });
  } catch (err) {
    throw new Error(`findById: Network error: ${err.message}`);
  }

  let text;
  try {
    text = await response.text();
  } catch (err) {
    throw new Error(`findById: Failed to read response body: ${err.message}`);
  }

  if (!response.ok) {
    let message = `findById: Failed to fetch user with id "${id}" (status ${response.status})`;
    if (text) {
      try {
        const payload = JSON.parse(text);
        if (payload && payload.message) {
          message = payload.message;
        }
      } catch {
        // ignore JSON parse errors for error payload
      }
    }
    throw new Error(message);
  }

  if (!text) {
    throw new Error(`findById: Empty response body for user with id "${id}"`);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`findById: Invalid JSON response: ${err.message}`);
  }
}

export async function createUser(data) {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('createUser: "data" must be an object');
  }
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    throw new Error(`createUser: Network error: ${err.message}`);
  }

  let text;
  try {
    text = await response.text();
  } catch (err) {
    throw new Error(`createUser: Failed to read response body: ${err.message}`);
  }

  if (!response.ok) {
    let message = `createUser: Failed to create user (status ${response.status})`;
    if (text) {
      try {
        const payload = JSON.parse(text);
        if (payload && payload.message) {
          message = payload.message;
        }
      } catch {
        // ignore JSON parse errors for error payload
      }
    }
    throw new Error(message);
  }

  if (!text) {
    throw new Error('createUser: Empty response body after creating user');
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`createUser: Invalid JSON response: ${err.message}`);
  }
}

export default {
  findById,
  createUser
};