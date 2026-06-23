const container = document.getElementById('fewshots-container');
const addBtn = document.getElementById('add-fewshot');
const template = document.getElementById('fewshot-template');

export function initFewShots() {
  addBtn.addEventListener('click', () => {
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector('.fewshot-row');
    row.querySelector('.fs-delete').addEventListener('click', () => row.remove());
    container.appendChild(clone);
  });
}

export function loadFewShots(fewShotsData) {
  container.innerHTML = '';
  fewShotsData.forEach(({ user, char }) => {
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector('.fewshot-row');
    row.querySelector('.fs-user').value = user;
    row.querySelector('.fs-char').value = char;
    row.querySelector('.fs-delete').addEventListener('click', () => row.remove());
    container.appendChild(clone);
  });
}

export function getFewShots() {
  return Array.from(container.querySelectorAll('.fewshot-row')).map(row => ({
    user: row.querySelector('.fs-user').value,
    char: row.querySelector('.fs-char').value,
  }));
}
