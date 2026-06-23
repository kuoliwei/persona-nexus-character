import { getFewShots } from './fewShots.js';

export function getFormData() {
  const tags = document.getElementById('tags').value
    .split(',')
    .map(t => t.trim())
    .filter(t => t !== '');

  return {
    name: document.getElementById('name').value,
    gender: document.getElementById('gender').value || null,
    tags,
    visibility: document.getElementById('visibility').value || 'private',
    introduction: document.getElementById('introduction').value,
    background: document.getElementById('background').value,
    opening: document.getElementById('opening').value,
    fewShots: getFewShots(),
  };
}

export function clearForm() {
  document.getElementById('character-form').reset();
  document.getElementById('fewshots-container').innerHTML = '';
}
