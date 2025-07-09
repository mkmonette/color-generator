import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_BASE_URL environment variable is not defined');
}

export async function subscribe(userId, plan) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/subscriptions`,
      { userId, plan },
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (![200, 201].includes(response.status)) {
      throw new Error(`Subscription failed: ${response.statusText}`);
    }
    return response.data;
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
}

export async function cancel(userId) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/subscriptions/${encodeURIComponent(userId)}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (![200, 204].includes(response.status)) {
      throw new Error(`Cancel subscription failed: ${response.statusText}`);
    }
    return response.data;
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
}