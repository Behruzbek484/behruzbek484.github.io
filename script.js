/* ===================== THEME ===================== */
function toggleTheme() {
  document.body.classList.toggle('light');
  const btn = document.getElementById('themeBtn');
  btn.textContent = document.body.classList.contains('light') ? '☀' : '☾';
  localStorage?.setItem && null; // no persistent storage used intentionally
}

/* ===================== MOBILE NAV ===================== */
function toggleNav() {
  document.getElementById('navList').classList.toggle('open');
}
document.querySelectorAll('#navList a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('navList').classList.remove('open'));
});

/* ===================== SCROLL PROGRESS + TO-TOP + SCROLLSPY ===================== */
const scrollBar = document.getElementById('scrollBar');
const toTop = document.getElementById('toTop');
const sections = document.querySelectorAll('section, .hero');
const navLinks = document.querySelectorAll('#navList a');

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  scrollBar.style.width = scrolled + '%';
  toTop.classList.toggle('show', h.scrollTop > 500);

  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (h.scrollTop >= top) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });

/* ===================== SCROLL REVEAL ===================== */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* stagger children of grids */
document.querySelectorAll('.goals-grid, .projects-grid, .contact-grid').forEach(grid => {
  grid.classList.add('stagger');
  io.observe(grid);
});

/* ===================== TERMINAL TYPING (syntax highlighted) ===================== */
const typingTarget = document.getElementById('typing');

const objectLines = [
  { text: 'const ', cls: 'c-key' }, { text: 'developer', cls: '' }, { text: ' = {\n', cls: 'c-p' },
  { text: '  name', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '"Behruzbek Bekturdiyev"', cls: 'c-str' }, { text: ',\n', cls: 'c-p' },
  { text: '  age', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '15', cls: 'c-fn' }, { text: ',\n', cls: 'c-p' },
  { text: '  from', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '"Xorazm, Uzbekiston"', cls: 'c-str' }, { text: ',\n', cls: 'c-p' },
  { text: '  learning', cls: 'c-key' }, { text: ': [', cls: 'c-p' }, { text: '"HTML"', cls: 'c-str' }, { text: ', ', cls: 'c-p' }, { text: '"CSS"', cls: 'c-str' }, { text: ', ', cls: 'c-p' }, { text: '"JS"', cls: 'c-str' }, { text: ', ', cls: 'c-p' }, { text: '"Python"', cls: 'c-str' }, { text: '],\n', cls: 'c-p' },
  { text: '  goal', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '"TU Munich"', cls: 'c-str' }, { text: ',\n', cls: 'c-p' },
  { text: '  status', cls: 'c-key' }, { text: ': ', cls: 'c-p' }, { text: '"coding..."', cls: 'c-str' }, { text: '\n', cls: 'c-p' },
  { text: '};', cls: 'c-p' }
];

let flatChars = [];
objectLines.forEach(seg => {
  for (const ch of seg.text) flatChars.push({ ch, cls: seg.cls });
});

let idx = 0;
function typeNext() {
  if (idx >= flatChars.length) return;
  const { ch, cls } = flatChars[idx];
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
  idx++;
  const delay = ch === '\n' ? 90 : (Math.random() * 18 + 10);
  setTimeout(typeNext, delay);
}
setTimeout(typeNext, 400);

/* =========================================================
   LETTERGLITCH — Matrix-style ambient background
   (ported from React Bits' LetterGlitch to vanilla JS/Canvas)
========================================================= */
(function letterGlitch() {
  const canvas = document.getElementById('glitchCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const glitchColors = ['#7c5cff', '#39ff8a', '#39c8ff'];
  const glitchSpeed = 55;
  const smooth = true;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01{}[]<>/;=+*#$%';
  const lettersArr = Array.from(characters);
  const fontSize = 15, charWidth = 10, charHeight = 20;

  let letters = [], grid = { columns: 0, rows: 0 };
  let lastGlitchTime = Date.now();

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
    const dpr = window.devicePixelRatio || 1;
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
    const count = Math.max(1, Math.floor(letters.length * 0.04));
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * letters.length);
      if (!letters[idx]) continue;
      letters[idx].char = randChar();
      letters[idx].targetColor = randColor();
      if (!smooth) { letters[idx].color = letters[idx].targetColor; letters[idx].progress = 1; }
      else letters[idx].progress = 0;
    }
  }

  function smoothTransitions() {
    let redraw = false;
    letters.forEach(l => {
      if (l.progress < 1) {
        l.progress = Math.min(1, l.progress + 0.05);
        const a = hexToRgb(l.color.startsWith('#') ? l.color : l.targetColor);
        const b = hexToRgb(l.targetColor);
        if (a && b) { l.color = lerpColor(a, b, l.progress); redraw = true; }
      }
    });
    if (redraw) draw();
  }

  function animate() {
    const now = Date.now();
    if (now - lastGlitchTime >= glitchSpeed) { updateLetters(); draw(); lastGlitchTime = now; }
    if (smooth) smoothTransitions();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  let rTimeout;
  window.addEventListener('resize', () => { clearTimeout(rTimeout); rTimeout = setTimeout(resizeCanvas, 120); });
  animate();
})();


/* =========================================================
   TARGETCURSOR — corner-lock custom cursor
   (ported from React Bits' TargetCursor, GSAP replaced by
   native CSS transitions + requestAnimationFrame)
========================================================= */
(function targetCursor() {
  const wrapper = document.getElementById('targetCursor');
  if (!wrapper) return;
  const isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 768;
  if (isMobile) { wrapper.style.display = 'none'; return; }

  const corners = wrapper.querySelectorAll('.target-cursor-corner');
  const dot = document.getElementById('cursorDot');
  const spinDuration = 2000; // ms
  const cornerSize = 12;
  const borderWidth = 3;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let curX = mouseX, curY = mouseY;
  let activeTarget = null;
  let spinAngle = 0;
  let lastTime = performance.now();

  const restPositions = [
    { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
    { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
    { x: cornerSize * 0.5, y: cornerSize * 0.5 },
    { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
  ];

  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('mousedown', () => {
    wrapper.style.transform += ' scale(0.9)';
    if (dot) dot.style.transform = 'translate(-50%,-50%) scale(0.7)';
  });
  window.addEventListener('mouseup', () => {
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
    const dt = now - lastTime; lastTime = now;
    curX += (mouseX - curX) * 0.35;
    curY += (mouseY - curY) * 0.35;

    if (activeTarget && document.body.contains(activeTarget)) {
      const rect = activeTarget.getBoundingClientRect();
      const positions = [
        { x: rect.left - borderWidth - curX, y: rect.top - borderWidth - curY },
        { x: rect.right + borderWidth - cornerSize - curX, y: rect.top - borderWidth - curY },
        { x: rect.right + borderWidth - cornerSize - curX, y: rect.bottom + borderWidth - cornerSize - curY },
        { x: rect.left - borderWidth - curX, y: rect.bottom + borderWidth - cornerSize - curY }
      ];
      corners.forEach((c, i) => { c.style.transform = `translate(${positions[i].x}px, ${positions[i].y}px)`; });
      wrapper.style.transform = `translate(-50%,-50%) translate(${curX}px, ${curY}px)`;
    } else {
      spinAngle += (360 / spinDuration) * dt;
      corners.forEach((c, i) => {
        const rad = spinAngle * Math.PI / 180;
        const rx = restPositions[i].x * Math.cos(rad) - restPositions[i].y * Math.sin(rad);
        const ry = restPositions[i].x * Math.sin(rad) + restPositions[i].y * Math.cos(rad);
        c.style.transform = `translate(${rx}px, ${ry}px)`;
      });
      wrapper.style.transform = `translate(-50%,-50%) translate(${curX}px, ${curY}px)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* =========================================================
   TRUEFOCUS — cycling word-focus tagline
   (ported from React Bits' TrueFocus to vanilla JS)
========================================================= */
(function trueFocus() {
  const container = document.getElementById('trueFocus');
  if (!container) return;
  const sentence = 'HTML CSS JavaScript Python';
  const words = sentence.split(' ');
  const animationDuration = 0.5, pauseBetween = 1.1;

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
    const parentRect = container.getBoundingClientRect();
    const active = wordEls[current].getBoundingClientRect();
    wordEls.forEach(w => w.classList.remove('active'));
    wordEls[current].classList.add('active');
    frame.style.transform = `translate(${active.left - parentRect.left}px, ${active.top - parentRect.top}px)`;
    frame.style.width = active.width + 'px';
    frame.style.height = active.height + 'px';
    frame.style.opacity = 1;
  }
  moveFrame();
  setInterval(() => { current = (current + 1) % wordEls.length; moveFrame(); }, (animationDuration + pauseBetween) * 1000);
  window.addEventListener('resize', moveFrame);
})();

/* =========================================================
   SPECULAR BUTTON — simplified rim-light + spotlight
========================================================= */
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

/* ===================== MEMORY GAME ===================== */
const emojis = ['{ }', '</>', '$', '#', '=>', '[]', '&&', '++'];
let memCards = [], flipped = [], matched = 0, moves = 0, lock = false;

function initMemory() {
  const grid = document.getElementById('memoryGrid');
  grid.innerHTML = '';
  memCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  flipped = []; matched = 0; moves = 0; lock = false;
  document.getElementById('moves').textContent = 0;
  document.getElementById('pairs').textContent = 0;
  document.getElementById('winMsg').style.display = 'none';

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
      a.classList.add('matched'); b.classList.add('matched');
      matched++;
      document.getElementById('pairs').textContent = matched;
      flipped = []; lock = false;
      if (matched === emojis.length) {
        document.getElementById('winMsg').style.display = 'block';
        launchConfetti();
      }
    } else {
      setTimeout(() => {
        a.classList.remove('flipped'); a.textContent = '';
        b.classList.remove('flipped'); b.textContent = '';
        flipped = []; lock = false;
      }, 700);
    }
  }
}
initMemory();

/* ===================== CONFETTI ===================== */
function launchConfetti() {
  const colors = ['#e6a94f', '#6fb7a8', '#f2ede4', '#8fb3ea'];
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
      { transform: `translateY(100vh) rotate(${rotate}deg)`, opacity: 0.3 }
    ], { duration: duration * 1000, easing: 'ease-in' });
    setTimeout(() => c.remove(), duration * 1000);
  }
}