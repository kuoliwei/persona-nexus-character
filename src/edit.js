import './style.css';
import { initFewShots, loadFewShots } from './fewShots.js';
import { getFormData, clearForm } from './form.js';
import { getCharacter, updateCharacter, deleteCharacter, getCurrentUserId } from './api.js';
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
      // 跳轉到「我的角色」頁面以確認編輯結果
      // 原因：用戶需要看到編輯後的角色信息，而「我的角色」頁面會重新載入最新數據
      // 技術細節：使用 window.parent.location.href 在主頁面（lobby）跳轉，避免在 iframe 內跳轉
      window.parent.location.href = `${LOBBY_APP_URL}/my-characters`;
    }, 1500);
  } else {
    messageBox.className = 'error';
    messageBox.textContent = `錯誤：${result.message}`;
  }
});

const deleteBtn = document.getElementById('delete-btn');
deleteBtn.addEventListener('click', async () => {
  const confirmed = confirm('確定要刪除此角色嗎？此動作無法復原。');
  if (!confirmed) return;

  try {
    const result = await deleteCharacter(characterId);

    if (result.status === 'success') {
      messageBox.className = 'success';
      messageBox.textContent = '角色已刪除！';
      setTimeout(() => {
        // 跳轉到「我的角色」頁面確認刪除結果
        // 原因：用戶需要看到角色已從列表中移除，直觀確認刪除成功
        // 技術細節：使用 window.parent.location.href 在主頁面（lobby）跳轉，避免在 iframe 內跳轉
        window.parent.location.href = `${LOBBY_APP_URL}/my-characters`;
      }, 1500);
    } else {
      messageBox.className = 'error';
      messageBox.textContent = `刪除失敗：${result.message}`;
    }
  } catch (error) {
    messageBox.className = 'error';
    messageBox.textContent = `刪除失敗：${error.message}`;
  }
});
