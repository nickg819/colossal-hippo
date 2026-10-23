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
