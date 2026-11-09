(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const config = window.WEDDING_CONFIG || {};
  const openButton = $('openInvitation');
  const intro = $('intro');
  const main = $('story');
  const music = new Audio('assets/music.mp3');
  music.loop = true;
  music.preload = 'none';
  music.volume = 0.55;
  let isMusicOn = false;

  function setSoundLabel() {
    $('soundText').textContent = isMusicOn ? 'Music on' : 'Music off';
    $('soundToggle').setAttribute('aria-pressed', String(isMusicOn));
  }
  async function toggleMusic() {
    if (isMusicOn) { music.pause(); isMusicOn = false; setSoundLabel(); return; }
    try { await music.play(); isMusicOn = true; }
    catch (err) { isMusicOn = false; console.info('Music needs user interaction:', err); }
    setSoundLabel();
  }
  $('soundToggle').addEventListener('click', toggleMusic);

  function revealInvitation() {
    intro.classList.add('opening');
    document.body.classList.add('invitation-open');
    setTimeout(() => main.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}), 300);
  }
  openButton.addEventListener('click', revealInvitation);
  $('scrollHint').addEventListener('click', revealInvitation);

  // The date is real; the ceremony start time has not yet been supplied.
  const weddingDate = new Date(config.weddingDateTime || '2026-12-04T00:00:00+02:00');
  function updateCountdown() {
    let remaining = Math.max(0, weddingDate.getTime() - Date.now());
    const d = Math.floor(remaining / 86400000); remaining %= 86400000;
    const h = Math.floor(remaining / 3600000); remaining %= 3600000;
    const m = Math.floor(remaining / 60000); remaining %= 60000;
    const s = Math.floor(remaining / 1000);
    $('days').textContent = String(d).padStart(2, '0');
    $('hours').textContent = String(h).padStart(2, '0');
    $('minutes').textContent = String(m).padStart(2, '0');
    $('seconds').textContent = String(s).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const observer = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      }), {threshold: 0.12}) : null;
  document.querySelectorAll('.reveal').forEach((el) => observer ? observer.observe(el) : el.classList.add('visible'));

  const signature = $('signature');
  const ctx = signature.getContext('2d');
  let drawing = false;
  let signed = false;
  function resizeCanvas() {
    const data = signed ? signature.toDataURL() : null;
    const rect = signature.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    signature.width = Math.round(rect.width * ratio);
    signature.height = Math.round(rect.height * ratio);
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.1;
    ctx.strokeStyle = '#48532c';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (data) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height); img.src = data; }
  }
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); });
  function point(event) { const rect = signature.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top }; }
  signature.addEventListener('pointerdown', event => { drawing = true; signed = true; signature.setPointerCapture(event.pointerId); const p = point(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
  signature.addEventListener('pointermove', event => { if (!drawing) return; const p = point(event); ctx.lineTo(p.x, p.y); ctx.stroke(); });
  ['pointerup', 'pointercancel'].forEach(type => signature.addEventListener(type, () => { drawing = false; }));
  $('clearSignature').addEventListener('click', () => { signed = false; ctx.clearRect(0, 0, signature.width, signature.height); });

  const destination = (config.scriptUrl || '').trim();
  function setStatus(el, message, error = false) { el.textContent = message; el.classList.toggle('error', error); }
  function submission(form, kind, status, button, extra) {
    if (!form.reportValidity()) return;
    if (!destination || !/^https:\/\/script\.google\.com\/macros\/s\//.test(destination)) {
      setStatus(status, 'The guest list is not connected yet. Please contact the hosts; this response has not been saved.', true);
      return;
    }
    button.disabled = true;
    setStatus(status, 'Sending your response…');
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = {type: kind, ...values, ...extra};
    // HTML form POST avoids cross-origin fetch restrictions on static GitHub Pages.
    // The Apps Script responds through postMessage with the matching request ID.
    const id = `wedding-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    payload.requestId = id;
    const hiddenForm = document.createElement('form');
    hiddenForm.action = destination;
    hiddenForm.method = 'POST';
    hiddenForm.target = 'submissionFrame';
    hiddenForm.style.display = 'none';
    for (const [key, value] of Object.entries(payload)) {
      const input = document.createElement('input'); input.type = 'hidden'; input.name = key; input.value = String(value ?? ''); hiddenForm.appendChild(input);
    }
    document.body.appendChild(hiddenForm);
    let settled = false;
    const finish = (success, message) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      hiddenForm.remove();
      button.disabled = false;
      setStatus(status, message, !success);
      if (success) { form.reset(); if (kind === 'wish') { signed = false; ctx.clearRect(0, 0, signature.width, signature.height); } }
    };
    const onMessage = (event) => {
      if (!/^https:\/\/(script\.google\.com|[a-z0-9-]+\.googleusercontent\.com)$/.test(event.origin)) return;
      const data = event.data;
      if (!data || data.source !== 'hamsa-youssef-rsvp' || data.requestId !== id) return;
      finish(Boolean(data.ok), data.ok ? 'Thank you! Your response has been saved. ♡' : (data.message || 'We could not save your response. Please try again.'));
    };
    window.addEventListener('message', onMessage);
    const timeout = setTimeout(() => finish(false, 'We could not confirm the response was saved. Please check with the hosts before trying again.'), 15000);
    try { hiddenForm.submit(); } catch (_) { finish(false, 'Unable to send your response. Please try again.'); }
  }
  $('rsvpForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const yes = form.querySelector('[name="attendance"]:checked')?.value === 'Yes';
    submission(form, 'rsvp', $('rsvpStatus'), $('rsvpSubmit'), {guests: yes ? $('guests').value : '0'});
  });
  $('wishForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    // The signature image is optional, and is stored in the owner's Google Sheet.
    submission(form, 'wish', $('wishStatus'), $('wishSubmit'), {signature: signed ? signature.toDataURL('image/png') : ''});
  });
})();
