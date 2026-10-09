(() => {
  'use strict';
  const dialog = document.getElementById('releaseAnnouncement');
  const key = 'deric-pluggaintdead2-announcement-last-shown';
  const cooldown = 10 * 60 * 1000;
  if (!dialog || typeof dialog.showModal !== 'function') return;
  let storage;
  try { storage = localStorage; storage.getItem(key); }
  catch (_) { try { storage = sessionStorage; } catch (_) {} }
  try {
    const lastShown = Number(storage && storage.getItem(key));
    if (lastShown && Date.now() - lastShown < cooldown) return;
  } catch (_) {}

  const remember = () => {
    try { if (storage) storage.setItem(key, String(Date.now())); } catch (_) {}
  };
  const dismiss = () => { remember(); dialog.close(); };
  dialog.querySelector('.release-announcement-close').addEventListener('click', dismiss);
  dialog.querySelector('.release-announcement-later').addEventListener('click', dismiss);
  dialog.querySelector('.release-announcement-listen').addEventListener('click', remember);
  dialog.addEventListener('cancel', remember);
  dialog.addEventListener('close', remember);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dismiss();
  });
  dialog.showModal();
  remember();
})();
