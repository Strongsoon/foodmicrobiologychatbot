;(function(){
  const me = document.currentScript || document.scripts[document.scripts.length - 1];
  const src = me && me.src ? me.src : '';
  let pluginRoot;
  if (src.includes('/js/')) {
    pluginRoot = src.split('/js/')[0];
  } else {
    pluginRoot = src.substring(0, src.lastIndexOf('/'));
  }
  window.HELPFUL_PLUGIN_URL = window.HELPFUL_PLUGIN_URL || pluginRoot;
  window.HELPFUL_ENDPOINT   = window.HELPFUL_ENDPOINT   || `${window.HELPFUL_PLUGIN_URL}/edit_helpful_answers.php`;
  //Console logging for debugging purposes. Not necessary in final version
  //console.log('HELPFUL_PLUGIN_URL =', window.HELPFUL_PLUGIN_URL);
  //console.log('HELPFUL_ENDPOINT   =', window.HELPFUL_ENDPOINT);
})();

const PAGE_SIZE = 10;
let haData = [];
let filteredData = [];
let currentPage = 1;

window.onload = () => {
  loadEntries();
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = searchInput.value.trim().toLowerCase();
      filteredData = haData.filter(item =>
        item.answer.toLowerCase().includes(term)
      );
      renderPage(1);
    }
  });
};

function loadEntries() {
  fetch(`${window.HELPFUL_ENDPOINT}?action=load`)
    .then(res => { if (!res.ok) throw res; return res.json(); })
    .then(data => {
      haData = data;
      filteredData = haData;
      renderPage(1);
    })
    .catch(err => {
      console.error('loadEntries error', err);
      setStatus('Error loading entries');
    });
}

function renderPage(page) {
  currentPage = page;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredData.slice(start, start + PAGE_SIZE);
  renderEntries(pageItems);
  renderPagination();
}

function renderEntries(entries) {
  const container = document.getElementById('ha-form');
  container.innerHTML = '';
  entries.forEach(item => {
    const block = document.createElement('div');
    block.className = 'ha-block';
    block.innerHTML = 
      `<p><strong>Answer:</strong> ${escapeHtml(item.answer)}</p>` +
      `<p><strong>Helpful:</strong> ${item.helpful}</p>` +
      `<p><strong>Not Helpful:</strong> ${item.not_helpful}</p>` +
      '<hr>';
    container.appendChild(block);
  });
}

function renderPagination() {
  const container = document.getElementById('pagination');
  container.innerHTML = '';
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE) || 1;
  if (totalPages <= 1) return;

  const prev = document.createElement('button');
  prev.textContent = 'Prev';
  prev.disabled = currentPage === 1;
  prev.onclick = () => renderPage(currentPage - 1);
  container.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => renderPage(i);
    container.appendChild(btn);
  }

  const next = document.createElement('button');
  next.textContent = 'Next';
  next.disabled = currentPage === totalPages;
  next.onclick = () => renderPage(currentPage + 1);
  container.appendChild(next);
}

function setStatus(msg) {
  document.getElementById('status').innerText = msg;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])
  );
}