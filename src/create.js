import './style.css';
import { initFewShots } from './fewShots.js';
import { getFormData, clearForm } from './form.js';
import { createCharacter, getCurrentUserId } from './api.js';
import { loadConfig, getConfig } from './config-loader.js';
// import { createCharacter } from './api.dev.js'; //測試用

await loadConfig();
const config = getConfig();
const LOGIN_APP_URL = config.frontends.web;
const LOBBY_APP_URL = config.frontends.lobby;

const form = document.getElementById('character-form');
const messageBox = document.getElementById('message-box');

const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get('token');

if (tokenFromUrl) {
  localStorage.setItem('token', tokenFromUrl);
  window.history.replaceState({}, '', window.location.pathname);
}

if (!getCurrentUserId()) {
  window.location.href = `${LOGIN_APP_URL}`;
} else {
  initFewShots();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = getFormData();
  const result = await createCharacter(data);

  if (result.status === 'success') {
    messageBox.className = 'success';
    messageBox.textContent = `角色創建成功！ID：${result.data.id}`;
    clearForm();
    setTimeout(() => {
      window.location.href = `${LOBBY_APP_URL}/`;
    }, 1500);
  } else {
    messageBox.className = 'error';
    messageBox.textContent = `錯誤：${result.message}`;
  }
});
