// hero text reveal
const hero = document.querySelector('.t-stagger');
requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-shown')));

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// phone row: start centered on the main screen at phone width
const row = document.querySelector('.showcase');
const main = document.querySelector('.deal-main');
if (row.scrollWidth > row.clientWidth) {
  row.scrollLeft = main.offsetLeft + main.offsetWidth / 2 - row.clientWidth / 2;
}

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

// press and hold to see the types
const peek = document.querySelector('.peek');
const show = () => peek.classList.add('is-peeking');
const hide = () => peek.classList.remove('is-peeking');
peek.addEventListener('pointerdown', show);
['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => peek.addEventListener(t, hide));
peek.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); show(); } });
peek.addEventListener('keyup', hide);
peek.addEventListener('blur', hide);
peek.addEventListener('contextmenu', (e) => e.preventDefault());

// beta request form
document.querySelectorAll('.beta').forEach((form) => {
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
    if (row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: fig.offsetLeft + fig.offsetWidth / 2 - row.clientWidth / 2, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
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
