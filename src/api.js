const BASE_URL = 'http://localhost:8000';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  console.log(`📤 [api.js] 即將送出請求，注入 Authorization header，token 是否存在：${!!token}`);
  return { 'Authorization': `Bearer ${token}` };
}

function decodeToken(token) {
  const payloadPart = token.split('.')[1];
  const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

export function getCurrentUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return decodeToken(token).id ?? null;
  } catch {
    return null;
  }
}

export async function getCharacter(id) {
  const response = await fetch(`${BASE_URL}/characters/${id}`, {
    headers: { ...getAuthHeader() }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '未知錯誤' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function updateCharacter(id, data) {
  const response = await fetch(`${BASE_URL}/characters/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '未知錯誤' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function createCharacter(data) {
  const response = await fetch(`${BASE_URL}/characters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '未知錯誤' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function deleteCharacter(id) {
  const response = await fetch(`${BASE_URL}/characters/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader()
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '未知錯誤' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}
