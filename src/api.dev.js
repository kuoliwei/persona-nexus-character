// 測試專用 - 使用假身分，不需要登入
// 正式使用請改用 api.js
const BASE_URL = 'http://localhost:5000/api/v1';
const FAKE_USER_ID = 'usr_test_001';

export async function getCharacter(id) {
  const response = await fetch(`${BASE_URL}/characters/${id}`, {
    headers: { 'x-user-id': FAKE_USER_ID }
  });
  return response.json();
}

export async function updateCharacter(id, data) {
  const response = await fetch(`${BASE_URL}/characters/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': FAKE_USER_ID
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function createCharacter(data) {
  const response = await fetch(`${BASE_URL}/characters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': FAKE_USER_ID
    },
    body: JSON.stringify(data)
  });
  return response.json();
}
