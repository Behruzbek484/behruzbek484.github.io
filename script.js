


function initTheme() {
  const saved = localStorage.getItem('portfolio-theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  if (saved === 'light' || (!saved && prefersLight)) {
    document.body.classList.add('light');
  }
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = document.body.classList.contains('light') ? '☀' : '☾';
}

function toggleTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = isLight ? '☀' : '☾';
  try {
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
  } catch (e) {
    console.warn('localStorage not accessible:', e);
  }
}
initTheme();


function toggleNav() {
  const list = document.getElementById('navList');
  if (list) list.classList.toggle('open');
}
document.querySelectorAll('#navList a').forEach(a => {
  a.addEventListener('click', () => {
    const list = document.getElementById('navList');
    if (list) list.classList.remove('open');
  });
});


const scrollBar = document.getElementById('scrollBar');
const toTop = document.getElementById('toTop');
const sections = document.querySelectorAll('section, .hero');
const navLinks = document.querySelectorAll('#navList a');

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const totalScroll = h.scrollHeight - h.clientHeight;
  const scrolled = totalScroll > 0 ? (h.scrollTop / totalScroll) * 100 : 0;
  if (scrollBar) scrollBar.style.width = scrolled + '%';
  if (toTop) toTop.classList.toggle('show', h.scrollTop > 450);

  let current = '';
  const isAtBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 50);

  if (isAtBottom) {
    current = 'boglanish';
  } else {
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (h.scrollTop >= top && sec.id) {
        current = sec.id;
      }
    });
  }

  navLinks.forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === '#' + current);
  });
}, { passive: true });


const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  document.querySelectorAll('.goals-grid, .projects-grid, .contact-grid, .about-stats, .interests-grid').forEach(grid => {
    grid.classList.add('stagger');
    io.observe(grid);
  });
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}


const typingTarget = document.getElementById('typing');
if (typingTarget) {
  const objectLines = [
    { text: 'const ', cls: 'c-key' }, { text: 'developer', cls: '' }, { text: ' = {\n', cls: 'c-p' },
    { text: '  name', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '"Behruzbek Bekturdiyev"', cls: 'c-str' }, { text: ',\n', cls: 'c-p' },
    { text: '  age', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '15', cls: 'c-fn' }, { text: ',\n', cls: 'c-p' },
    { text: '  from', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '"Xorazm, O\'zbekiston"', cls: 'c-str' }, { text: ',\n', cls: 'c-p' },
    { text: '  learning', cls: 'c-key' }, { text: ': [', cls: 'c-p' }, { text: '"HTML"', cls: 'c-str' }, { text: ', ', cls: 'c-p' }, { text: '"CSS"', cls: 'c-str' }, { text: ', ', cls: 'c-p' }, { text: '"JS"', cls: 'c-str' }, { text: ', ', cls: 'c-p' }, { text: '"Python"', cls: 'c-str' }, { text: '],\n', cls: 'c-p' },
    { text: '  aiAssistant', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: 'true', cls: 'c-fn' }, { text: ',\n', cls: 'c-p' },
    { text: '  goal', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '"TU Munich"', cls: 'c-str' }, { text: ',\n', cls: 'c-p' },
    { text: '  status', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '"coding & innovating..."', cls: 'c-str' }, { text: '\n', cls: 'c-p' },
    { text: '};', cls: 'c-p' }
  ];

  let flatChars = [];
  objectLines.forEach(seg => {
    for (const ch of seg.text) flatChars.push({ ch, cls: seg.cls });
  });

  let charIdx = 0;
  function typeNext() {
    if (charIdx >= flatChars.length) return;
    const { ch, cls } = flatChars[charIdx];
    if (cls) {
      let last = typingTarget.lastElementChild;
      if (!last || last.dataset.cls !== cls) {
        last = document.createElement('span');
        last.dataset.cls = cls;
        last.className = cls;
        typingTarget.appendChild(last);
      }
      last.textContent += ch;
    } else {
      typingTarget.appendChild(document.createTextNode(ch));
    }
    charIdx++;
    const delay = ch === '\n' ? 80 : (Math.random() * 16 + 10);
    setTimeout(typeNext, delay);
  }
  setTimeout(typeNext, 350);
}


(function letterGlitch() {
  const canvas = document.getElementById('glitchCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const glitchColors = ['#7c5cff', '#39ff8a', '#39c8ff'];
  const glitchSpeed = 60;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01{}[]<>/;=+*#$%';
  const lettersArr = Array.from(characters);
  const fontSize = 15, charWidth = 10, charHeight = 20;

  let letters = [], grid = { columns: 0, rows: 0 };
  let lastGlitchTime = Date.now();
  let isTabActive = true;

  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
  });

  const randChar = () => lettersArr[Math.floor(Math.random() * lettersArr.length)];
  const randColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];

  function hexToRgb(hex) {
    hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b);
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return res ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) } : null;
  }
  function lerpColor(a, b, t) {
    return `rgb(${Math.round(a.r + (b.r - a.r) * t)},${Math.round(a.g + (b.g - a.g) * t)},${Math.round(a.b + (b.b - a.b) * t)})`;
  }

  function initLetters(cols, rows) {
    grid = { columns: cols, rows };
    letters = Array.from({ length: cols * rows }, () => ({
      char: randChar(), color: randColor(), targetColor: randColor(), progress: 1
    }));
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initLetters(Math.ceil(rect.width / charWidth), Math.ceil(rect.height / charHeight));
    draw();
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = fontSize + 'px "IBM Plex Mono", monospace';
    ctx.textBaseline = 'top';
    letters.forEach((l, i) => {
      const x = (i % grid.columns) * charWidth;
      const y = Math.floor(i / grid.columns) * charHeight;
      ctx.fillStyle = l.color;
      ctx.fillText(l.char, x, y);
    });
  }

  function updateLetters() {
    const count = Math.max(1, Math.floor(letters.length * 0.035));
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * letters.length);
      if (!letters[idx]) continue;
      letters[idx].char = randChar();
      letters[idx].targetColor = randColor();
      letters[idx].progress = 0;
    }
  }

  function smoothTransitions() {
    let redraw = false;
    letters.forEach(l => {
      if (l.progress < 1) {
        l.progress = Math.min(1, l.progress + 0.06);
        const a = hexToRgb(l.color.startsWith('#') ? l.color : l.targetColor);
        const b = hexToRgb(l.targetColor);
        if (a && b) { l.color = lerpColor(a, b, l.progress); redraw = true; }
      }
    });
    if (redraw) draw();
  }

  function animate() {
    if (isTabActive) {
      const now = Date.now();
      if (now - lastGlitchTime >= glitchSpeed) { updateLetters(); draw(); lastGlitchTime = now; }
      smoothTransitions();
    }
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  let rTimeout;
  window.addEventListener('resize', () => { clearTimeout(rTimeout); rTimeout = setTimeout(resizeCanvas, 150); });
  animate();
})();


(function targetCursor() {
  const wrapper = document.getElementById('targetCursor');
  if (!wrapper) return;

  const hasPointer = window.matchMedia('(pointer: fine)').matches && window.innerWidth > 768;
  if (!hasPointer) {
    wrapper.style.display = 'none';
    return;
  }
  document.body.classList.add('has-custom-cursor');

  const corners = wrapper.querySelectorAll('.target-cursor-corner');
  const dot = document.getElementById('cursorDot');
  const spinDuration = 2200;
  const cornerSize = 12;
  const borderWidth = 3;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let curX = mouseX, curY = mouseY;
  let activeTarget = null;
  let spinAngle = 0;
  let lastTime = performance.now();
  let isMouseDown = false;
  let isMouseInside = true;

  const restPositions = [
    { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
    { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
    { x: cornerSize * 0.5, y: cornerSize * 0.5 },
    { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
  ];

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMouseInside) {
      isMouseInside = true;
      wrapper.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    isMouseInside = false;
    wrapper.style.opacity = '0';
  });

  window.addEventListener('mousedown', () => {
    isMouseDown = true;
    if (dot) dot.style.transform = 'translate(-50%,-50%) scale(0.6)';
  });
  window.addEventListener('mouseup', () => {
    isMouseDown = false;
    if (dot) dot.style.transform = 'translate(-50%,-50%) scale(1)';
  });

  window.addEventListener('mouseover', e => {
    const target = e.target.closest('.cursor-target');
    if (!target || target === activeTarget) return;
    activeTarget = target;
  });

  document.addEventListener('mouseout', e => {
    if (activeTarget && (!e.relatedTarget || !e.relatedTarget.closest || e.relatedTarget.closest('.cursor-target') !== activeTarget)) {
      if (!e.target.closest || e.target.closest('.cursor-target') === activeTarget) activeTarget = null;
    }
  });

  function tick(now) {
    const dt = now - lastTime;
    lastTime = now;
    curX += (mouseX - curX) * 0.35;
    curY += (mouseY - curY) * 0.35;

    const scale = isMouseDown ? 0.9 : 1;

    if (activeTarget && document.body.contains(activeTarget)) {
      const rect = activeTarget.getBoundingClientRect();
      const positions = [
        { x: rect.left - borderWidth - curX, y: rect.top - borderWidth - curY },
        { x: rect.right + borderWidth - cornerSize - curX, y: rect.top - borderWidth - curY },
        { x: rect.right + borderWidth - cornerSize - curX, y: rect.bottom + borderWidth - cornerSize - curY },
        { x: rect.left - borderWidth - curX, y: rect.bottom + borderWidth - cornerSize - curY }
      ];
      corners.forEach((c, i) => {
        c.style.transform = `translate(${positions[i].x}px, ${positions[i].y}px)`;
      });
      wrapper.style.transform = `translate(-50%,-50%) translate(${curX}px, ${curY}px) scale(${scale})`;
    } else {
      spinAngle += (360 / spinDuration) * dt;
      corners.forEach((c, i) => {
        const rad = spinAngle * Math.PI / 180;
        const rx = restPositions[i].x * Math.cos(rad) - restPositions[i].y * Math.sin(rad);
        const ry = restPositions[i].x * Math.sin(rad) + restPositions[i].y * Math.cos(rad);
        c.style.transform = `translate(${rx}px, ${ry}px)`;
      });
      wrapper.style.transform = `translate(-50%,-50%) translate(${curX}px, ${curY}px) scale(${scale})`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();


(function trueFocus() {
  const container = document.getElementById('trueFocus');
  if (!container) return;
  const sentence = 'HTML CSS JavaScript Python React AI';
  const words = sentence.split(' ');
  const animationDuration = 0.5, pauseBetween = 1.2;

  words.forEach(w => {
    const span = document.createElement('span');
    span.className = 'focus-word';
    span.textContent = w;
    container.appendChild(span);
  });
  const frame = document.createElement('div');
  frame.className = 'focus-frame';
  frame.innerHTML = '<span class="corner top-left"></span><span class="corner top-right"></span><span class="corner bottom-left"></span><span class="corner bottom-right"></span>';
  container.appendChild(frame);

  const wordEls = container.querySelectorAll('.focus-word');
  let current = 0;

  function moveFrame() {
    if (!wordEls[current]) return;
    const parentRect = container.getBoundingClientRect();
    const active = wordEls[current].getBoundingClientRect();
    wordEls.forEach(w => w.classList.remove('active'));
    wordEls[current].classList.add('active');
    frame.style.transform = `translate(${active.left - parentRect.left}px, ${active.top - parentRect.top}px)`;
    frame.style.width = active.width + 'px';
    frame.style.height = active.height + 'px';
    frame.style.opacity = 1;
  }
  setTimeout(moveFrame, 200);
  setInterval(() => {
    current = (current + 1) % wordEls.length;
    moveFrame();
  }, (animationDuration + pauseBetween) * 1000);
  window.addEventListener('resize', moveFrame);
})();


document.querySelectorAll('.spec-btn').forEach(btn => {
  btn.addEventListener('pointermove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    btn.style.setProperty('--spec-x', x + 'px');
    btn.style.setProperty('--spec-y', y + 'px');
    const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * 180 / Math.PI + 90;
    btn.style.setProperty('--spec-angle', angle + 'deg');
  });
});


const emojis = ['{ }', '</>', '$', '#', '=>', '[]', '&&', '++'];
let memCards = [], flipped = [], matched = 0, moves = 0, lock = false;
let memTimeout = null;

function initMemory() {
  const grid = document.getElementById('memoryGrid');
  if (!grid) return;
  if (memTimeout) clearTimeout(memTimeout);
  grid.innerHTML = '';
  memCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  flipped = []; matched = 0; moves = 0; lock = false;
  document.getElementById('moves').textContent = 0;
  document.getElementById('pairs').textContent = 0;
  const winMsg = document.getElementById('winMsg');
  if (winMsg) winMsg.style.display = 'none';

  memCards.forEach((val, i) => {
    const card = document.createElement('div');
    card.className = 'mem-card cursor-target';
    card.dataset.val = val;
    card.dataset.i = i;
    card.textContent = '';
    card.addEventListener('click', () => flipCard(card));
    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  card.textContent = card.dataset.val;
  flipped.push(card);

  if (flipped.length === 2) {
    moves++;
    document.getElementById('moves').textContent = moves;
    lock = true;
    const [a, b] = flipped;
    if (a.dataset.val === b.dataset.val) {
      a.classList.add('matched');
      b.classList.add('matched');
      matched++;
      document.getElementById('pairs').textContent = matched;
      flipped = [];
      lock = false;
      if (matched === emojis.length) {
        const winMsg = document.getElementById('winMsg');
        if (winMsg) winMsg.style.display = 'block';
        launchConfetti();
      }
    } else {
      memTimeout = setTimeout(() => {
        a.classList.remove('flipped'); a.textContent = '';
        b.classList.remove('flipped'); b.textContent = '';
        flipped = [];
        lock = false;
      }, 700);
    }
  }
}
initMemory();


let bugScore = 0, bugTimeLeft = 30, bugTimer = null, bugSpawner = null, bugRunning = false;
const bugEmojis = ['🐛', '🐞', '🕷️', '🦗'];

function spawnBug() {
  const grid = document.getElementById('bugGrid');
  if (!grid) return;
  const bug = document.createElement('div');
  bug.className = 'bug-target';
  bug.textContent = bugEmojis[Math.floor(Math.random() * bugEmojis.length)];
  const gw = grid.clientWidth, gh = grid.clientHeight;
  const maxX = Math.max(10, gw - 55);
  const maxY = Math.max(10, gh - 55);
  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);
  bug.style.left = x + 'px';
  bug.style.top = y + 'px';
  let squashedFlag = false;

  bug.addEventListener('click', () => {
    if (squashedFlag) return;
    squashedFlag = true;
    bugScore++;
    document.getElementById('bugScore').textContent = bugScore;
    bug.classList.add('squashed');
    setTimeout(() => bug.remove(), 200);
  });
  grid.appendChild(bug);
  setTimeout(() => { if (!squashedFlag && bug.parentNode) bug.remove(); }, 1200);
}

function startBugSquash() {
  if (bugRunning) return;
  bugRunning = true;
  bugScore = 0; bugTimeLeft = 30;
  document.getElementById('bugScore').textContent = 0;
  document.getElementById('bugTime').textContent = 30;
  const winMsg = document.getElementById('bugWinMsg');
  if (winMsg) winMsg.style.display = 'none';
  document.getElementById('bugGrid').innerHTML = '';
  document.getElementById('bugStartBtn').textContent = "O'ynalmoqda...";

  bugSpawner = setInterval(spawnBug, 650);
  bugTimer = setInterval(() => {
    bugTimeLeft--;
    document.getElementById('bugTime').textContent = bugTimeLeft;
    if (bugTimeLeft <= 0) endBugSquash();
  }, 1000);
}

function endBugSquash() {
  clearInterval(bugSpawner);
  clearInterval(bugTimer);
  bugRunning = false;
  document.getElementById('bugGrid').innerHTML = '';
  document.getElementById('bugStartBtn').textContent = 'Qayta boshlash';
  const msg = document.getElementById('bugWinMsg');
  if (msg) {
    msg.textContent = `Natija: ${bugScore} ta xato muvaffaqiyatli tuzatildi! ${bugScore >= 15 ? 'Ajoyib natija! 🏆' : 'Yaxshi urinish!'}`;
    msg.style.display = 'block';
  }
  if (bugScore >= 15) launchConfetti();
}


function launchConfetti() {
  const colors = ['#7c5cff', '#39ff8a', '#39c8ff', '#ffbd2e', '#ff6159'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(c);
    const duration = Math.random() * 2 + 2;
    const rotate = Math.random() * 720 - 360;
    c.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(100vh) rotate(${rotate}deg)`, opacity: 0.2 }
    ], { duration: duration * 1000, easing: 'ease-in' });
    setTimeout(() => c.remove(), duration * 1000);
  }
}


/* =========================================================
   TELEGRAM NOTIFICATION CONFIG
   Sayt orqali kelgan xabarlar Telegramingizga kelishi uchun
========================================================= */
const TELEGRAM_CONFIG = {
  botToken: "9140405945:AAFE-lPg1faG9HxiWx5lcy90lN0KW9iaguo",
  chatId: "7225516678"
};

async function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = document.getElementById('contactSubmitBtn');
  const btnText = document.getElementById('contactBtnText');
  const feedback = document.getElementById('contactFeedback');

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    showContactFeedback("Iltimos, barcha zarur maydonlarni to'ldiring!", 'error');
    return;
  }

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = "Yuborilmoqda...";

  let sentViaServer = false;

  // 1. Try sending to backend server (/api/contact)
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const data = await res.json();
      showContactFeedback(data.message || "Xabaringiz muvaffaqiyatli yuborildi!", 'success');
      form.reset();
      launchConfetti();
      sentViaServer = true;
    }
  } catch (err) {
    console.log('Backend server yoqilmagan, Telegram tekshirilmoqda...');
  }

  // 2. If not sent via server (e.g. on GitHub Pages), send directly via Telegram Bot API
  if (!sentViaServer) {
    if (TELEGRAM_CONFIG.botToken && TELEGRAM_CONFIG.chatId) {
      try {
        const text = `🔔 <b>Portfolio saytingizdan yangi xabar!</b>\n\n` +
          `👤 <b>Kimdan:</b> ${name}\n` +
          `📧 <b>Email:</b> ${email}\n` +
          `📝 <b>Mavzu:</b> ${subject || 'Portfolio orqali xabar'}\n` +
          `💬 <b>Xabar:</b>\n${message}\n\n` +
          `🌐 <i>GitHub Pages orqali yuborildi</i>`;

        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CONFIG.chatId,
            text,
            parse_mode: 'HTML'
          })
        });

        if (tgRes.ok) {
          showContactFeedback("Rahmat! Xabaringiz to'g'ridan-to'g'ri Behruzbekning Telegramiga yuborildi!", 'success');
          form.reset();
          launchConfetti();
        } else {
          throw new Error('Telegram API error');
        }
      } catch (tgErr) {
        console.warn('Telegram yuborishda xatolik:', tgErr);
        saveLocallyAndFallback(name, email, subject, message, form);
      }
    } else {
      saveLocallyAndFallback(name, email, subject, message, form);
    }
  }

  if (btn) btn.disabled = false;
  if (btnText) btnText.textContent = "xabarni yuborish";
}

function saveLocallyAndFallback(name, email, subject, message, form) {
  try {
    const pending = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    pending.push({ name, email, subject, message, date: new Date().toISOString() });
    localStorage.setItem('portfolio_messages', JSON.stringify(pending));
  } catch {}
  showContactFeedback("Rahmat! Xabaringiz qabul qilindi. Tezkor javob olish uchun Telegram orqali ham bog'lanishingiz mumkin: @bekturdiyefv", 'success');
  form.reset();
}

function showContactFeedback(msg, type) {
  const el = document.getElementById('contactFeedback');
  if (!el) return;
  el.textContent = msg;
  el.className = 'form-feedback ' + type;
  el.style.display = 'inline-block';
  setTimeout(() => {
    el.style.display = 'none';
  }, 7000);
}


const chatHistory = [];
let isAIBusy = false;

function toggleAIChat() {
  const win = document.getElementById('aiChatWindow');
  if (!win) return;
  const isOpen = win.classList.toggle('open');
  if (isOpen) {
    const input = document.getElementById('aiChatInput');
    if (input) setTimeout(() => input.focus(), 250);
  }
}

function minimizeAIChat() {
  const win = document.getElementById('aiChatWindow');
  if (win) win.classList.remove('open');
}

function clearAIChat() {
  const body = document.getElementById('aiChatBody');
  if (!body) return;
  body.innerHTML = `
    <div class="ai-msg ai-msg-bot">
      <div class="ai-avatar">🤖</div>
      <div class="ai-bubble">
        <p>Suhbat tarixi tozalandi. Yangi savollaringiz bo'lsa marhamat!</p>
      </div>
    </div>
  `;
  chatHistory.length = 0;
}

function handleAIKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    document.getElementById('aiChatForm').requestSubmit();
  }
}

function sendQuickPrompt(btn) {
  const text = btn.textContent.replace(/^[^a-zA-Z0-9\u0400-\u04FF\?]+/, '').trim();
  const input = document.getElementById('aiChatInput');
  if (input) {
    input.value = text;
    document.getElementById('aiChatForm').requestSubmit();
  }
}

async function handleAIChatSubmit(event) {
  event.preventDefault();
  if (isAIBusy) return;

  const input = document.getElementById('aiChatInput');
  const userText = (input.value || '').trim();
  if (!userText) return;

  input.value = '';
  appendChatMessage(userText, 'user');
  chatHistory.push({ role: 'user', text: userText });

  isAIBusy = true;
  const typingEl = showAITyping();

  try {
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, history: chatHistory }),
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      removeAITyping(typingEl);
      if (data.reply) {
        streamAIBubble(data.reply);
        chatHistory.push({ role: 'model', text: data.reply });
        updateAISuggestions(data.suggestions);
        return;
      }
    }
    throw new Error('Backend unavailable');
  } catch (err) {
    
    removeAITyping(typingEl);
    const fallback = getLocalAIAnswer(userText);
    streamAIBubble(fallback.reply);
    chatHistory.push({ role: 'model', text: fallback.reply });
    updateAISuggestions(fallback.suggestions);
  } finally {
    isAIBusy = false;
  }
}

function showAITyping() {
  const body = document.getElementById('aiChatBody');
  if (!body) return null;
  const wrap = document.createElement('div');
  wrap.className = 'ai-msg ai-msg-bot';
  wrap.innerHTML = `
    <div class="ai-avatar">🤖</div>
    <div class="ai-bubble ai-typing">
      <span></span><span></span><span></span>
    </div>
  `;
  body.appendChild(wrap);
  body.scrollTop = body.scrollHeight;
  return wrap;
}

function removeAITyping(el) {
  if (el && el.parentNode) el.remove();
}

function appendChatMessage(text, sender) {
  const body = document.getElementById('aiChatBody');
  if (!body) return;
  const msgEl = document.createElement('div');
  msgEl.className = `ai-msg ai-msg-${sender}`;
  const avatar = sender === 'bot' ? '🤖' : '👤';
  msgEl.innerHTML = `
    <div class="ai-avatar">${avatar}</div>
    <div class="ai-bubble">${formatMarkdown(text)}</div>
  `;
  body.appendChild(msgEl);
  body.scrollTop = body.scrollHeight;
}

function streamAIBubble(fullText) {
  const body = document.getElementById('aiChatBody');
  if (!body) return;
  const msgEl = document.createElement('div');
  msgEl.className = 'ai-msg ai-msg-bot';
  msgEl.innerHTML = `
    <div class="ai-avatar">🤖</div>
    <div class="ai-bubble"></div>
  `;
  body.appendChild(msgEl);
  const bubble = msgEl.querySelector('.ai-bubble');

  let i = 0;
  const step = Math.max(1, Math.floor(fullText.length / 60));
  const interval = setInterval(() => {
    i = Math.min(fullText.length, i + step);
    bubble.innerHTML = formatMarkdown(fullText.slice(0, i));
    body.scrollTop = body.scrollHeight;
    if (i >= fullText.length) {
      clearInterval(interval);
      bubble.innerHTML = formatMarkdown(fullText);
    }
  }, 16);
}

function updateAISuggestions(suggestions) {
  const cont = document.getElementById('aiSuggestions');
  if (!cont || !Array.isArray(suggestions) || suggestions.length === 0) return;
  cont.innerHTML = '';
  suggestions.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'ai-chip cursor-target';
    btn.textContent = s;
    btn.onclick = () => sendQuickPrompt(btn);
    cont.appendChild(btn);
  });
}


function formatMarkdown(str) {
  if (!str) return '';
  let s = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  
  s = s.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');

  
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  
  s = s.replace(/^([•\-\*]\s.+)$/gm, '<li>$1</li>');
  s = s.replace(/<li>[•\-\*]\s/g, '<li>');
  s = s.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  
  s = s.replace(/^(\d+\.\s.+)$/gm, '<li>$1</li>');
  s = s.replace(/<li>\d+\.\s/g, '<li>');

  
  const paragraphs = s.split(/\n\n+/);
  return paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<ul>') || p.startsWith('<ol>')) return p;
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('');
}


let recognition = null;
let isRecording = false;

function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = document.getElementById('aiVoiceBtn');
  const input = document.getElementById('aiChatInput');

  if (!SpeechRecognition) {
    alert("Kechirasiz, brauzeringiz ovozli kiritishni (Web Speech API) qo'llab-quvvatlamaydi. Chrome yoki Edge dan foydalaning.");
    return;
  }

  if (isRecording) {
    if (recognition) recognition.stop();
    isRecording = false;
    if (btn) btn.classList.remove('recording');
    return;
  }

  try {
    recognition = new SpeechRecognition();
    recognition.lang = 'uz-UZ';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isRecording = true;
      if (btn) btn.classList.add('recording');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (input) {
        input.value = transcript;
        document.getElementById('aiChatForm').requestSubmit();
      }
    };

    recognition.onerror = () => {
      isRecording = false;
      if (btn) btn.classList.remove('recording');
    };

    recognition.onend = () => {
      isRecording = false;
      if (btn) btn.classList.remove('recording');
    };

    recognition.start();
  } catch (err) {
    console.warn('Speech recognition error:', err);
    isRecording = false;
    if (btn) btn.classList.remove('recording');
  }
}


function getLocalAIAnswer(userMessage) {
  const msg = (userMessage || '').toLowerCase().trim();

  
  if (/(salom|assalom|qalesiz|qalaysiz|privet|hello|hi|hey|xayrli)/i.test(msg)) {
    return {
      reply: `Assalomu alaykum! 😊 Men **Behruzbekning AI yordamchisiman**.\n\nSizga Behruzbek haqida nimalar qiziq?\n• Uning **loyihalari**\n• **Ko'nikma va texnologiyalari**\n• **Kelajakdagi maqsadlari**\n• Yoki **bog'lanish yo'llari** haqida so'rashingiz mumkin!`,
      suggestions: ["Behruzbek haqida", "Loyihalari", "Ko'nikmalari", "Bog'lanish"]
    };
  }

  
  if (/(kim|haqida|biografiya|tanish|yosh|qayerdan|sinf|maktab|o'zi|who|about)/i.test(msg)) {
    return {
      reply: `**Behruzbek Bekturdiyev** — 15 yoshli iqtidorli yosh dasturchi! 💻\n\n• **Yashash joyi:** Xorazm viloyati, Yangariq tumani\n• **O'qish joyi:** Najot Ta'lim (Urganch) va 9-sinf o'quvchisi\n• **Qiziqishlari:** Frontend, Python botlar, o'yinlar, gitara va musiqa\n• **Ish quroli:** Acer Aspire A515-57\n\nU hozirdanoq bir nechta jiddiy veb-sayt va bot loyihalarini muvaffaqiyatli yakunlagan!`,
      suggestions: ["Qanday loyihalari bor?", "Qaysi tillarni biladi?", "Maqsadlari nima?"]
    };
  }

  
  if (/(loyiha|loyihalari|portfoli|proyekt|project|qilgan|ishlar|doppicoin|whirl|onlineshop)/i.test(msg)) {
    return {
      reply: `Behruzbek yaratgan asosiy loyihalar: 🚀\n\n1. **Whirl SaaS** — Figma dizaynidan pikselgacha aniq ko'chirilgan to'liq responsive landing sahifa (HTML, CSS).\n2. **OnlineShopMIX** — Admin panelli va savatchali zamonaviy dark-tema onlayn do'kon (HTML, CSS, JS).\n3. **Doppicoin Telegram Bot** — Click-to-earn Telegram bot va Flask Web Mini App (HMAC-SHA256 xavfsizlik bilan).\n4. **Ultimate Car Tuning Studio** — Brauzerda ishlaydigan interaktiv avtomobil tyuning o'yini (Vanilla JS).\n5. **Referral Bot** — Do'stlarni taklif qilish va ball yig'ish tizimi (Python, aiogram, SQLite).`,
      suggestions: ["Doppicoin haqida", "Texnologiyalari", "Bog'lanish"]
    };
  }

  
  if (/(til|texnologiya|skill|ko'nikma|qobiliyat|biladi|stack|javascript|python|html|css|react)/i.test(msg)) {
    return {
      reply: `Behruzbekning texnologik steki: 🛠️\n\n• **Frontend:** HTML5, CSS3 (Flexbox, Grid, Animatsiyalar), JavaScript (ES6+, DOM, Fetch API)\n• **Backend & Botlar:** Python (aiogram, Flask, Mini App APIlar)\n• **Ma'lumotlar bazasi:** SQLite\n• **Dizayn & Asboblar:** Figma, Git, GitHub Pages, VS Code\n• **Hozir o'rganmoqda:** React va chuqurlashtirilgan algoritmlar!`,
      suggestions: ["Loyihalarni ko'rish", "Kelajak rejalari", "Aloqaga chiqish"]
    };
  }

  
  if (/(maqsad|reja|universitet|tu munich|germaniya|kelajak|goal|future)/i.test(msg)) {
    return {
      reply: `Behruzbekning kelajakdagi katta maqsadlari: 🎯\n\n1. **TU Munich** — Germaniyaning dunyo top 50 taligiga kiruvchi nufuzli Texnika Universitetida o'qish!\n2. **React & Mobil dasturlash** — React, Flutter/React Native orqali foydali mobil ilovalar yaratish.\n3. **Olimpiadalar** — Xalqaro dasturlash musobaqalarida faxrli o'rinlarni egallash.\n4. **Freelance & Startaplar** — Xalqaro miqyosda haqiqiy loyihalarni amalga oshirish.`,
      suggestions: ["Aloqa ma'lumotlari", "Kim o'zi Behruzbek?"]
    };
  }

  
  if (/(aloqa|bog'lan|kontakt|email|telegram|yozmoqchiman|ish|buyurtma|hamkorlik|contact|hire)/i.test(msg)) {
    return {
      reply: `Behruzbek bilan quyidagi kanallar orqali tezda bog'lanishingiz mumkin: 📬\n\n• **Telegram:** [@bekturdiyefv](https://t.me/bekturdiyefv)\n• **Email:** [behruzbekbekturdiyev011@gmail.com](mailto:behruzbekbekturdiyev011@gmail.com)\n• **Instagram:** [@bekturdiyefv](https://www.instagram.com/bekturdiyefv)\n• **LinkedIn:** [Behruzbek Bekturdiyev](https://www.linkedin.com/in/behruzbek-bekturdiyev-a94838348)\n\nShuningdek, saytning pastki qismidagi formadan to'g'ridan-to'g'ri xabar yuborishingiz ham mumkin!`,
      suggestions: ["Loyihalar haqida", "Telegram orqali yozish"]
    };
  }

  
  if (/(sertifikat|diplom|yutuq|certificate|it park)/i.test(msg)) {
    return {
      reply: `Behruzbek 2025-yilda **Technology Village · IT Park Xorazm** tomonidan taqdim etilgan 3 oylik "Kompyuter Savodxonligi" rasmiy sertifikatiga ega (№ 12122). Hozirda Najot Ta'limda dasturlash kurslarida o'qishni davom ettirmoqda.`,
      suggestions: ["Ko'nikmalari", "Loyihalari"]
    };
  }

  
  return {
    reply: `Savolingiz uchun rahmat! Men Behruzbek Bekturdiyevning portfolio yordamchisiman.\n\nBehruzbek haqida nimalarni bilishni xohlaysiz? Quyidagi mavzulardan birini tanlashingiz yoki yangi savol berishingiz mumkin:`,
    suggestions: [
      "Behruzbek kim?",
      "Qanday loyihalari bor?",
      "Qaysi dasturlash tillarini biladi?",
      "Behruzbek bilan bog'lanish"
    ]
  };
}


