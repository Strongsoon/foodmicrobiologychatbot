console.log('⟳ unanswered.js loaded');

const PAGE_SIZE = 10;
let questions = [];
let currentPage = 1;

window.onload = () => {
  console.log('→ window.onload');
  loadQuestions();
};

function loadQuestions() {
  console.log('→ loadQuestions()');
  setStatus('');
  fetch(`${fmUnanswered.apiEndpoint}?action=load`)
    .then(r => {
      console.log('  ← load status:', r.status);
      if (!r.ok) throw r;
      return r.json();
    })
    .then(data => {
      console.log('  ← load JSON:', data);
      let qdata = data.questions;
      if (Array.isArray(qdata)) {
        questions = qdata;
      } else if (qdata && typeof qdata === 'object') {
        // fallback if it was an object
        questions = Object.values(qdata);
      } else {
        questions = [];
      }

      currentPage = 1;
      renderPage();
    })
    .catch(err => {
      console.error(err);
      setStatus('Error loading questions', true);
    });
}

function renderPage() {
  console.log(`→ renderPage(${currentPage})`);
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = questions.slice(start, start + PAGE_SIZE);
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  if (slice.length === 0) {
    container.innerHTML = '<p>No unanswered questions.</p>';
  }

  slice.forEach(item => {
    const block = document.createElement('div');
    block.className = 'qa-block';
    block.innerHTML = `
      <p><strong>Q:</strong> ${escapeHtml(item.question)}</p>
      <textarea placeholder="Type your answer…"></textarea>
      <button>Publish Answer</button>
    `;
    block.querySelector('button').onclick = () => {
      console.log('► Publish clicked for:', item);
      publishAnswer(item, block.querySelector('textarea').value);
    };
    container.appendChild(block);
  });

  renderPagination();
}

function renderPagination() {
  const total = Math.ceil(questions.length / PAGE_SIZE);
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';
  if (total < 2) return;

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === currentPage ? 'active' : '';
    btn.onclick = () => {
      currentPage = i;
      renderPage();
    };
    pag.appendChild(btn);
  }
}

function publishAnswer(item, answerText) {
  console.log('→ publishAnswer()', item, 'answer=', answerText);
  if (!answerText.trim()) {
    setStatus('Please type an answer first.', true);
    return;
  }
  fetch(`${fmUnanswered.apiEndpoint}?action=answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question:  item.question,
      timestamp: item.timestamp,
      answer:    answerText.trim()
    })
  })
    .then(r => {
      console.log('  ← publish status:', r.status);
      if (!r.ok) throw r;
      return r.text();
    })
    .then(msg => {
      console.log('  ← publish text:', msg);
      setStatus(msg);
      loadQuestions();
    })
    .catch(err => {
      console.error(err);
      setStatus('Error publishing answer.', true);
    });
}
function setStatus(msg, isError = false) {
  const s = document.getElementById('status');
  s.textContent = msg;
  s.style.color = isError ? 'red' : 'green';
}
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]
  );
}
