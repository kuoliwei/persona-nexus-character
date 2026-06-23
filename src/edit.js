import './style.css';
import { initFewShots, loadFewShots } from './fewShots.js';
import { getFormData, clearForm } from './form.js';
import { getCharacter, updateCharacter, getCurrentUserId } from './api.js';
import { loadConfig, getConfig } from './config-loader.js';
// import { getCharacter, updateCharacter } from './api.dev.js'; //測試用

await loadConfig();
const config = getConfig();
const LOGIN_APP_URL = config.frontends.web;
const LOBBY_APP_URL = config.frontends.lobby;

const form = document.getElementById('character-form');
const messageBox = document.getElementById('message-box');

const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get('token');
const characterId = params.get('id');

if (tokenFromUrl) {
  localStorage.setItem('token', tokenFromUrl);
  window.history.replaceState({}, '', window.location.pathname);
}

if (!getCurrentUserId()) {
  window.location.href = `${LOGIN_APP_URL}/`;
} else if (!characterId) {
  messageBox.className = 'error';
  messageBox.textContent = '錯誤：缺少角色 ID，請從角色列表進入此頁面。';
} else {
  initFewShots();
  loadCharacter();
}

async function loadCharacter() {
  const result = await getCharacter(characterId);

  if (result.status !== 'success') {
    messageBox.className = 'error';
    messageBox.textContent = `載入失敗：${result.message}`;
    return;
  }

  const c = result.data;
  document.getElementById('name').value = c.name;
  document.getElementById('gender').value = c.gender ?? '';
  document.getElementById('tags').value = c.tags.join(',');
  document.getElementById('visibility').value = c.visibility;
  document.getElementById('introduction').value = c.introduction ?? '';
  document.getElementById('background').value = c.background;
  document.getElementById('opening').value = c.opening;
  loadFewShots(c.fewShots);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = getFormData();
  const result = await updateCharacter(characterId, data);

  if (result.status === 'success') {
    messageBox.className = 'success';
    messageBox.textContent = '角色更新成功！';
    setTimeout(() => {
      window.location.href = `${LOBBY_APP_URL}/`;
    }, 1500);
  } else {
    messageBox.className = 'error';
    messageBox.textContent = `錯誤：${result.message}`;
  }
});
