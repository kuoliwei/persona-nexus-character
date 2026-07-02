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

  try {
    const data = getFormData();
    const result = await createCharacter(data);

    if (result.status === 'success') {
      messageBox.className = 'success';
      messageBox.textContent = `角色創建成功！ID：${result.data.id}`;
      clearForm();
      setTimeout(() => {
        // 跳轉到「我的角色」頁面而不是首頁
        // 原因：用戶創建的角色通常是私有的，應該在「我的角色」頁面查看新建的角色
        // 技術細節：使用 window.parent.location.href 在主頁面（lobby）跳轉，避免在 iframe 內跳轉
        window.parent.location.href = `${LOBBY_APP_URL}/my-characters`;
      }, 1500);
    } else {
      messageBox.className = 'error';
      messageBox.textContent = `錯誤：${result.message}`;
    }
  } catch (error) {
    messageBox.className = 'error';
    messageBox.textContent = `❌ 創建失敗：${error.message}`;
    console.error('[create.js] 角色創建失敗:', error);
  }
});
