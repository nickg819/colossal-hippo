// hero text reveal
const hero = document.querySelector('.t-stagger');
requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-shown')));

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// phone row: center the main screen, and snap only once the screens sit still
const row = document.querySelector('.showcase');
const center = (smooth) => {
  if (row.scrollWidth <= row.clientWidth) return;
  const mid = row.querySelector('.deal-main');
  row.scrollTo({ left: mid.offsetLeft + mid.offsetWidth / 2 - row.clientWidth / 2, behavior: smooth ? 'smooth' : 'auto' });
};
let touched = false;
['pointerdown', 'touchstart', 'wheel'].forEach((t) => row.addEventListener(t, () => { touched = true; }, { passive: true }));
const settle = (ms) => setTimeout(() => { if (!touched) center(false); row.classList.add('snap'); }, ms);
center(false);
settle(reduce.matches ? 0 : 1600);

// pointer tilt, mouse only
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const MAX = 10;
document.querySelectorAll('.t-tilt').forEach((tilt) => {
  const card = tilt.querySelector('.t-tilt-card');
  const reset = () => {
    tilt.classList.remove('is-hover');
    card.classList.remove('is-tilting');
    card.style.setProperty('--tilt-rx', '0deg');
    card.style.setProperty('--tilt-ry', '0deg');
  };
  tilt.addEventListener('pointermove', (e) => {
    if (reduce.matches || !fine.matches || e.pointerType !== 'mouse') return;
    const r = tilt.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    tilt.classList.add('is-hover');
    card.classList.add('is-tilting');
    card.style.setProperty('--tilt-ry', ((px - 0.5) * MAX).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-rx', ((0.5 - py) * MAX).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-gx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--tilt-gy', (py * 100).toFixed(1) + '%');
  });
  tilt.addEventListener('pointerleave', reset);
});

// table: glyphs from the app
const GLYPHS = {
  rec: '<g stroke-width="1.4"><g transform="translate(1.6 2) rotate(12 6 10)"><path d="M4.2 1.8h3.6l-.25 7.6a1.55 1.55 0 0 1-3.1 0z"/><path d="M4.35 5.2h3.3"/><path d="M6 11v7.4M3.8 18.5h4.4"/></g><g transform="translate(10.4 2) rotate(-12 6 10)"><path d="M4.2 1.8h3.6l-.25 7.6a1.55 1.55 0 0 1-3.1 0z"/><path d="M4.35 5.2h3.3"/><path d="M6 11v7.4M3.8 18.5h4.4"/></g></g>',
  lag: '<text x="12" y="16.2" font-family="system-ui, sans-serif" font-size="11" font-weight="800" letter-spacing="-0.3" text-anchor="middle" fill="currentColor" stroke="none">LAG</text>',
  tag: '<text x="12" y="16.2" font-family="system-ui, sans-serif" font-size="11" font-weight="800" letter-spacing="-0.3" text-anchor="middle" fill="currentColor" stroke="none">TAG</text>',
  maniac: '<circle cx="8.5" cy="15" r="6.5"/><rect x="11.8" y="8.1" width="4.2" height="3" rx="0.6" transform="rotate(45 13.9 9.6)"/><path d="M15.2 8C16.2 4.2 18.8 3.6 19.6 6.4"/><path d="M21 4.5v1.7M21 8.8v1.7M18.6 7.5h1.6M21.8 7.5h1.7M19.3 5.8l1.1 1.1M22.7 5.8l-1.1 1.1M19.3 9.2l1.1-1.1M22.7 9.2l-1.1-1.1"/><path d="M4.8 15a3.7 3.7 0 0 1 3-3.6"/>',
  station: '<g stroke-width="1.4"><path d="M3.2 6.2V3.2h17.6v3"/><path d="M7 5.6V21h10V5.6"/><circle cx="12" cy="12" r="2.6"/><path d="M7 17.6a3.4 3.4 0 0 1 3.4 3.4M17 17.6a3.4 3.4 0 0 0-3.4 3.4"/></g>',
  bully: '<path d="M7.5 9C4 9 3 6.5 3 4M16.5 9c3.5 0 4.5-2.5 4.5-5"/><path d="M7.5 9h9L15 18c-.3 1.5-1.5 2.5-3 2.5S9.3 19.5 9 18z"/><path d="M7.5 10.5L5 12M16.5 10.5L19 12"/><path d="M10 12.5h.01M14 12.5h.01M10.8 17h.01M13.2 17h.01"/>',
  negative: '<g stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M7.4 8.2l3.4 1.5M16.6 8.2l-3.4 1.5"/><path fill="currentColor" d="M8.7 10.6l1.9.8-.3 1a.9.9 0 0 1-1.7-.2zM15.3 10.6l-1.9.8.3 1a.9.9 0 0 0 1.7-.2z"/><path d="M8.3 17a4.3 3.2 0 0 1 7.4 0"/></g>',
  solid: '<path fill="currentColor" stroke-width="0.8" d="M5.9 3.3C8.5 8 8.7 12 7.3 15.4 12 16.5 15 16 18.1 14.9 15.5 8.5 10.5 4.8 5.9 3.3z"/><path d="M3 18.5c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0"/><path d="M3 21.5c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0"/>',
  fish: '<g stroke-width="1.3"><ellipse cx="10.5" cy="12.5" rx="7.5" ry="5.5"/><path d="M18 12.5L21.5 8c.8 2.5.8 6 0 9z"/><path d="M7.8 7.6C8.8 5 11.8 4 13.8 5l-1.6 2.6"/><path d="M10 14c1.5-1.2 3-1.2 3.8-.6-.3 1.6-1.8 2.5-3.2 2.4z"/><path d="M9 17.8c.5 1.5 1.8 2.3 3.2 2.2-.2-1.2-.8-2-1.7-2.4"/><path d="M4.4 14.3c.8.6 1.6.6 2.2.1"/></g><circle cx="6.8" cy="11" r="1.2" fill="currentColor" stroke="none"/>',
  whale: '<path d="M6.8 13.6C9.6 10.7 13 8.5 17.2 8.5Q21 8.5 21 11.2V16.7Q21 18.6 19.1 18.6H4.4C2.2 18.6 1.8 15.4 3 12.6C3.4 11.5 4 10.6 4.7 10L5.3 8.6L5.4 6.2L6.6 4.8L7.5 7.1L10.4 8.2L8.5 9.2L6.6 9.7C4.8 10.7 3.7 13 4.9 13.4Q5.6 14.1 6.8 13.6Z"/><circle cx="13.7" cy="13.45" r="0.6" fill="currentColor" stroke="none"/>',
  stranger: '<g stroke="none"><path fill="#5cb85c" d="M12 2.2C16.2 2.2 18.4 4.9 18.4 8.2C18.4 11.6 14.6 15.2 12 15.2C9.4 15.2 5.6 11.6 5.6 8.2C5.6 4.9 7.8 2.2 12 2.2Z"/><path fill="#5cb85c" d="M3.5 22C3.5 18.8 5.6 16.8 8.6 16.2L12 18.4L15.4 16.2C18.4 16.8 20.5 18.8 20.5 22Z"/><path fill="#111111" d="M7.6 8.6C8.2 7.6 9.9 7.7 10.6 8.9C10.9 9.5 10.5 10.3 9.6 10.2C8.6 10.1 7.6 9.4 7.6 8.6Z"/><path fill="#111111" d="M16.4 8.6C15.8 7.6 14.1 7.7 13.4 8.9C13.1 9.5 13.5 10.3 14.4 10.2C15.4 10.1 16.4 9.4 16.4 8.6Z"/></g>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.7-6 7-6s6.2 2 7 6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
};
const NAMES = { rec: 'Rec', lag: 'LAG', tag: 'TAG', maniac: 'Maniac', station: 'Calling Station', bully: 'Big Bet Bully', negative: 'Miserable Reg', solid: 'Solid Reg' };
const MARKS = { fish: { stroke: '#9b3c00', fill: '#ffead7' }, whale: { stroke: '#1e6b3c', fill: '#e3f6e9' } };
const svg = (g, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${g}</svg>`;

// table: seats and players
const SPOTS = [[183, 305], [365, 220], [536, 220], [717, 305], [765, 497], [645, 655], [450, 682], [254, 655], [135, 497]];
const YOU = 6;
const PLAYERS = [
  { name: 'Omar F', types: [] },
  { name: 'Priya K', types: ['rec', 'lag'], mark: 'whale' },
  { name: 'Bea L', types: ['rec', 'maniac'], mark: 'whale' },
  { name: 'Dana R', types: ['rec', 'station'], mark: 'fish' },
  { name: 'Gus W', types: ['negative', 'tag'] },
  { name: 'Kenji S', types: ['solid', 'lag'] },
  null,
  { name: 'Lena P', types: ['solid', 'tag'] },
  { name: 'Marco T', types: ['bully', 'lag'] },
];

const peek = document.querySelector('.peek');
const live = document.querySelector('.peek-wrap [aria-live]');
const table = document.createElement('div');
table.className = 'table';
table.innerHTML = `<div class="table-head">${svg(GLYPHS.back)}<p class="table-date">Nov. 4, 2026</p><p class="table-count">9 players seated</p></div><div class="felt"></div>`;
peek.replaceChildren(table);
peek.setAttribute('aria-label', 'A table in incognito mode. Choose a player, then choose another seat to swap them.');

const seatOf = new Map();
const seats = PLAYERS.map((p, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  if (!p) {
    b.className = 'seat seat-you';
    b.disabled = true;
    b.innerHTML = `<span class="seat-lift"><span class="ring">${svg(GLYPHS.user, 'you')}</span></span><span class="seat-name">You</span>`;
  } else {
    const stranger = !p.types.length;
    const icons = stranger ? svg(GLYPHS.stranger) : p.types.map((t) => svg(GLYPHS[t])).join('');
    const hidden = stranger ? icons : '<span class="face-dot"></span>';
    const mark = p.mark ? `<span class="badge" style="--fill:${MARKS[p.mark].fill};--stroke:${MARKS[p.mark].stroke}">${svg(GLYPHS[p.mark])}</span>` : '';
    b.className = 'seat' + (stranger ? ' seat-stranger' : '');
    b.innerHTML = `<span class="seat-lift"><span class="ring"><span class="face face-hidden${stranger ? ' face-one' : ''}">${hidden}</span><span class="face face-shown${stranger ? ' face-one' : ''}">${icons}</span>${mark}</span></span><span class="seat-name">${p.name}</span>`;
    p.label = `${p.name}, ${stranger ? 'no types yet' : p.types.map((t) => NAMES[t]).join(' and ')}${p.mark ? ', ' + p.mark : ''}`;
    b.setAttribute('aria-label', p.label);
    b.setAttribute('aria-pressed', 'false');
  }
  table.append(b);
  seatOf.set(b, i);
  return b;
});
const place = (b) => {
  const [x, y] = SPOTS[seatOf.get(b)];
  b.style.setProperty('--x', x);
  b.style.setProperty('--y', y);
};
seats.forEach(place);
const playerAt = (i) => seats.find((b) => seatOf.get(b) === i);
const info = (b) => PLAYERS[seats.indexOf(b)];

// table: press and hold to see the types
let held = false;
let picked = null;
const show = () => table.classList.add('is-peeking');
const hide = () => { if (!picked) table.classList.remove('is-peeking'); };

// table: swap two seats, sliding each into place
const slide = (moves) => {
  const first = new Map(moves.map(([b]) => [b, b.getBoundingClientRect()]));
  moves.forEach(([b, to]) => { seatOf.set(b, to); b.style.transform = ''; place(b); });
  [...seats].sort((p, q) => seatOf.get(p) - seatOf.get(q)).forEach((b) => table.append(b));
  if (reduce.matches) return;
  moves.forEach(([b]) => {
    const a = first.get(b);
    const z = b.getBoundingClientRect();
    if (a.left === z.left && a.top === z.top) return;
    b.animate([{ transform: `translate(${a.left - z.left}px, ${a.top - z.top}px)` }, { transform: 'none' }],
      { duration: 380, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  });
};
const swap = (b, to) => {
  const from = seatOf.get(b);
  const other = playerAt(to);
  slide(other ? [[b, to], [other, from]] : [[b, to]]);
  live.textContent = other ? `${info(b).name} and ${info(other).name} swapped seats.` : `${info(b).name} moved.`;
};

// table: drag a player to another seat
const HOLD = 350;
let drag = null;
let dragged = false;
const centers = () => {
  const r = table.getBoundingClientRect();
  return SPOTS.map(([x, y]) => [r.left + (x / 900) * r.width, r.top + (y / 824) * r.height]);
};
const seatUnder = (x, y, from) => {
  const reach = table.getBoundingClientRect().width * 0.141 * 0.8;
  let best = -1;
  let near = reach;
  centers().forEach(([cx, cy], i) => {
    if (i === from || i === YOU) return;
    const d = Math.hypot(cx - x, cy - y);
    if (d < near) { near = d; best = i; }
  });
  return best;
};
const target = (i) => seats.forEach((b) => b.classList.toggle('is-target', i >= 0 && seatOf.get(b) === i));
const lift = () => {
  drag.lifted = true;
  drag.seat.classList.add('is-lifted');
  if (navigator.vibrate) navigator.vibrate(8);
};
const endDrag = (drop) => {
  if (!drag) return;
  const { seat, lifted, over } = drag;
  clearTimeout(drag.timer);
  drag = null;
  target(-1);
  seat.classList.remove('is-lifted');
  if (lifted) {
    dragged = true;
    if (drop && over >= 0) swap(seat, over);
    else slide([[seat, seatOf.get(seat)]]);
  }
};

table.addEventListener('pointerdown', (e) => {
  dragged = false;
  held = true;
  show();
  try { table.setPointerCapture(e.pointerId); } catch {}
  const seat = e.target.closest('.seat');
  if (!seat || seat.disabled) return;
  drag = { seat, id: e.pointerId, x: e.clientX, y: e.clientY, lifted: false, over: -1, mouse: e.pointerType === 'mouse' };
  drag.timer = setTimeout(() => { if (drag) lift(); }, HOLD);
});
table.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (!drag.lifted) {
    if (Math.hypot(dx, dy) < 6) return;
    if (drag.mouse) lift();
    else { clearTimeout(drag.timer); drag = null; return; }
  }
  drag.seat.style.transform = `translate(${dx}px, ${dy}px)`;
  drag.over = seatUnder(e.clientX, e.clientY, seatOf.get(drag.seat));
  target(drag.over);
});
table.addEventListener('touchmove', (e) => { if (drag && drag.lifted) e.preventDefault(); }, { passive: false });
table.addEventListener('pointerup', () => { endDrag(true); hide(); });
table.addEventListener('pointercancel', () => { endDrag(false); hide(); });
table.addEventListener('lostpointercapture', () => { endDrag(false); hide(); });
peek.addEventListener('contextmenu', (e) => e.preventDefault());

// table: keyboard, choose a player then a seat
const unpick = () => {
  if (!picked) return;
  picked.classList.remove('is-picked');
  picked.setAttribute('aria-pressed', 'false');
  picked = null;
  hide();
};
table.addEventListener('click', (e) => {
  const seat = e.target.closest('.seat');
  if (dragged) { dragged = false; return; }
  if (!seat || seat.disabled) return;
  if (!picked) {
    picked = seat;
    seat.classList.add('is-picked');
    seat.setAttribute('aria-pressed', 'true');
    show();
    live.textContent = `Moving ${info(seat).name}. Choose another seat, or press Escape.`;
    return;
  }
  const b = picked;
  unpick();
  if (b !== seat) { swap(b, seatOf.get(seat)); b.focus(); }
});
table.addEventListener('focusout', (e) => { if (!table.contains(e.relatedTarget)) unpick(); });
table.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && picked) { live.textContent = 'Move cancelled.'; unpick(); }
});

// table: show the types once when it first scrolls in
const demoPeek = () => {
  if (reduce.matches) return;
  setTimeout(() => {
    if (held) return;
    show();
    setTimeout(() => { if (!held) hide(); }, 1300);
  }, 1100);
};

// hold below-the-fold content until it scrolls in, staggering what enters together
const reveal = new IntersectionObserver((entries) => {
  entries.filter((e) => e.isIntersecting).forEach((e, n) => {
    e.target.style.setProperty('--i', Math.min(n, 6));
    e.target.classList.add('is-shown');
    reveal.unobserve(e.target);
    if (e.target.classList.contains('peek-wrap')) demoPeek();
  });
}, { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.t-reveal').forEach((el) => reveal.observe(el));

// beta request form
const PHONES = {
  iPhone: { email: 'Email on your Apple ID', thanks: 'Thanks. I will send a TestFlight invite to that email.' },
  Android: { email: 'Email', thanks: 'Thanks. You can install SeatSpy now.' },
};
document.querySelectorAll('.beta').forEach((form) => {
  const email = form.querySelector('.beta-input');
  form.querySelectorAll('input[name="phone"]').forEach((radio) => radio.addEventListener('change', () => {
    const phone = PHONES[radio.value];
    email.placeholder = phone.email;
    form.querySelector('.beta-label').textContent = phone.email;
    form.querySelector('.beta-thanks').textContent = phone.thanks;
  }));
  const fields = form.querySelector('.beta-fields');
  const send = form.querySelector('.beta-send');
  const done = form.querySelector('.beta-done');
  const error = form.querySelector('.beta-error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.hidden = true;
    send.disabled = true;
    send.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      fields.hidden = true;
      form.querySelector('.beta-phone').hidden = true;
      form.querySelector('.beta-install').hidden = new FormData(form).get('phone') !== 'Android';
      done.hidden = false;
      done.querySelector('.t-success-check').setAttribute('data-state', 'in');
    } catch {
      error.hidden = false;
      send.disabled = false;
      send.textContent = 'Request beta access';
    }
  });
});

// tap a screen to swap it into the middle
const rowEl = document.querySelector('.phones');
rowEl.querySelectorAll('.deal').forEach((fig) => {
  const label = fig.querySelector('img').alt.split(',')[0];
  fig.setAttribute('role', 'button');
  fig.setAttribute('aria-label', `Show ${label} in the middle`);
  fig.tabIndex = 0;
  const go = () => {
    const mid = rowEl.querySelector('.deal-main');
    if (fig === mid) return;
    rowEl.classList.add('dealt');
    const figs = [...rowEl.children];
    const first = new Map(figs.map((f) => [f, f.getBoundingClientRect()]));
    const marker = document.createComment('');
    rowEl.replaceChild(marker, fig);
    rowEl.replaceChild(fig, mid);
    rowEl.replaceChild(mid, marker);
    const x = fig.style.getPropertyValue('--x');
    fig.style.setProperty('--x', mid.style.getPropertyValue('--x'));
    mid.style.setProperty('--x', x);
    mid.classList.remove('deal-main');
    fig.classList.add('deal-main');
    mid.setAttribute('aria-pressed', 'false');
    fig.setAttribute('aria-pressed', 'true');
    row.classList.remove('snap');
    touched = false;
    center(!reduce.matches);
    settle(reduce.matches ? 0 : 650);
    if (reduce.matches) return;
    figs.forEach((f) => {
      const a = first.get(f);
      const b = f.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      const s = a.width / b.width;
      if (!dx && !dy && s === 1) return;
      f.animate(
        [{ transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transformOrigin: 'top left', transform: 'none' }],
        { duration: f === fig || f === mid ? 550 : 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    });
  };
  fig.addEventListener('click', go);
  fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
});
rowEl.querySelector('.deal-main').setAttribute('aria-pressed', 'true');
rowEl.querySelectorAll('.deal:not(.deal-main)').forEach((f) => f.setAttribute('aria-pressed', 'false'));
