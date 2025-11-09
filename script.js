
;(function(){
  const me = document.currentScript 
           || document.scripts[document.scripts.length - 1];
  const src = me && me.src ? me.src : '';
  let pluginRoot;
  if (src.includes('/js/')) {
    pluginRoot = src.split('/js/')[0];
  } else {
    pluginRoot = src.substring(0, src.lastIndexOf('/'));
  }
  
  window.PLUGIN_URL = window.PLUGIN_URL || pluginRoot;
  window.ENDPOINT   = window.ENDPOINT   || `${window.PLUGIN_URL}/edit_json.php`;
  
  console.log('✅ PLUGIN_URL =', window.PLUGIN_URL);
  console.log('✅ ENDPOINT   =', window.ENDPOINT);
})();



const PAGE_SIZE = 10;
let dataMap = {};
let filteredKeys = [];
let currentPage = 1;
let deletedStack = [];

// Utility: escape HTML
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[m]);
}

// Show status messages
function setStatus(msg) {
  const s = document.getElementById('status');
  if (s) s.innerText = msg;
}

// Enable/disable Undo button
function updateUndoBtn() {
  const btn = document.getElementById('undoBtn');
  if (btn) btn.disabled = deletedStack.length === 0;
}

// Prepend a new blank entry
function addNewEntry() {
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  const key = `NEW_${Date.now()}`;
  dataMap[key] = [''];
  filteredKeys = [key, ...Object.keys(dataMap).filter(k => k !== key)];
  currentPage = 1;
  renderPage(1);
  setStatus('Added new question.');
  updateUndoBtn();
}

// Fetch and load JSON
function loadData() {
  console.log('→ loading from:', window.ENDPOINT, '?action=load');
  fetch(`${window.ENDPOINT}?action=load`)
    .then(res => { if (!res.ok) throw res; return res.json(); })
    .then(json => {
      dataMap = json || {};
      resetFilter();
      currentPage = 1;
      deletedStack = [];
      renderPage(1);
      updateUndoBtn();
    })
    .catch(err => {
      console.error('loadData error', err);
      setStatus('Error loading data');
    });
}

// Show all keys
function resetFilter() {
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  filteredKeys = Object.keys(dataMap);
}

// Render page slice
function renderPage(page) {
  currentPage = page;
  const start = (page - 1) * PAGE_SIZE;
  const slice = filteredKeys.slice(start, start + PAGE_SIZE);
  renderFormSubset(slice);
  renderPagination();
  updateUndoBtn();
}

// Build blocks
function renderFormSubset(keys) {
  const form = document.getElementById('qa-form');
  form.innerHTML = '';
  keys.forEach(k => {
    const answers = Array.isArray(dataMap[k]) ? dataMap[k] : [''];
    form.insertAdjacentHTML('beforeend', generateBlockHTML(k, answers));
  });
}

// Single block
function generateBlockHTML(origKey, answers) {
  const escKey = escapeHtml(origKey);
  const label  = origKey.startsWith('NEW_') ? '' : escKey;
  let html = `<div class="qa-block">
      <input type="hidden" class="original-key" value="${escKey}">
      <label><strong>Question:</strong>
        <input type="text" class="question" value="${label}" placeholder="Enter question">
      </label><br>`;
  answers.forEach(ans => {
    html += `<div class="answer-block">
        <label>Answer:
          <textarea class="answer" oninput="autoResize(this)" placeholder="Enter answer">${escapeHtml(ans)}</textarea>
        </label>
        <button type="button" onclick="deleteAnswer(this)">−</button>
      </div>`;
  });
  html += `<button type="button" onclick="addAnswer(this)">+ Add Answer</button>
      <button type="button" onclick="deleteQuestion(this)">Delete Question</button>
      <hr>
    </div>`;
  return html;
}

// Add answer row
function addAnswer(btn) {
  const block = btn.closest('.qa-block');
  block.insertAdjacentHTML('beforeend', `<div class="answer-block">
      <label>Answer:
        <textarea class="answer" oninput="autoResize(this)" placeholder="Enter answer"></textarea>
      </label>
      <button type="button" onclick="deleteAnswer(this)">−</button>
    </div>`);
}

// Remove answer
function deleteAnswer(btn) {
  const blocks = btn.closest('.qa-block').querySelectorAll('.answer-block');
  if (blocks.length > 1) btn.closest('.answer-block').remove();
  else setStatus('At least one answer required.');
}

// Delete Q&A
function deleteQuestion(btn) {
  const block = btn.closest('.qa-block');
  const key = block.querySelector('.original-key').value;
  deletedStack.push({ key, answers: dataMap[key] });
  delete dataMap[key];
  resetFilter();
  renderPage(currentPage);
  setStatus('Deleted. You can undo.');
  updateUndoBtn();
}

// Undo in LIFO order
function undoDelete() {
  if (deletedStack.length === 0) return;
  const { key, answers } = deletedStack.pop();
  dataMap[key] = answers;
  resetFilter();
  renderPage(currentPage);
  setStatus('Restored deletion.');
  updateUndoBtn();
}

// Autosize
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// Gather and save
function saveChanges() {
  document.querySelectorAll('.qa-block').forEach(block => {
    const oldKey = block.querySelector('.original-key').value;
    const newQ = block.querySelector('.question').value.trim();
    const ans  = Array.from(block.querySelectorAll('.answer')).map(a=>a.value.trim()).filter(v=>v);
    if (!newQ || ans.length === 0) return;
    if (newQ !== oldKey) delete dataMap[oldKey];
    dataMap[newQ] = ans;
  });
  fetch(`${window.ENDPOINT}?action=save`, {
    method: 'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(dataMap, null, 2)
  })
  .then(r=>r.text())
  .then(msg=>{ setStatus(msg); loadData(); })
  .catch(e=>{ console.error(e); setStatus('Error saving'); });
}

// Pagination controls
function renderPagination() {
  const ctr = document.getElementById('pagination');
  ctr.innerHTML = '';
  const total = Math.ceil(filteredKeys.length / PAGE_SIZE) || 1;
  const delta = 2;
  const range = [];
  for (let i = Math.max(1, currentPage-delta); i<=Math.min(total, currentPage+delta); i++) range.push(i);
  const btn = (l,p,a,d)=>`<button ${d?'disabled':''} ${a?'class="active"':''} onclick="renderPage(${p})">${l}</button>`;
  const ell = `<button disabled>…</button>`;
  ctr.insertAdjacentHTML('beforeend', btn('Prev',currentPage-1,false,currentPage===1));
  if(range[0]>1){ ctr.insertAdjacentHTML('beforeend',btn('1',1)); if(range[0]>2) ctr.insertAdjacentHTML('beforeend',ell); }
  range.forEach(i=>ctr.insertAdjacentHTML('beforeend',btn(i,i,i===currentPage,false)));
  if(range.slice(-1)[0]<total){ if(range.slice(-1)[0]<total-1) ctr.insertAdjacentHTML('beforeend',ell); ctr.insertAdjacentHTML('beforeend',btn(total,total,false,false)); }
  ctr.insertAdjacentHTML('beforeend', btn('Next',currentPage+1,false,currentPage===total));
}

// Init bindings
window.onload = () => {
  document.getElementById('searchInput')?.addEventListener('input', function() {
    filteredKeys = Object.keys(dataMap).filter(k=>k.toLowerCase().includes(this.value.trim().toLowerCase()));
    renderPage(1);
  });
  document.getElementById('saveBtn')?.addEventListener('click', saveChanges);
  document.getElementById('undoBtn')?.addEventListener('click', undoDelete);
  const addBtn = document.getElementById('addNewEntryBtn') || document.getElementById('addQuestionBtn');
  if (addBtn) addBtn.addEventListener('click', addNewEntry);
  loadData();
};
