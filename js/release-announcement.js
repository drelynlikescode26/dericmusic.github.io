(() => {
  'use strict';
  const dialog = document.getElementById('releaseAnnouncement');
  const key = 'deric-pluggaintdead2-announcement-dismissed';
  if (!dialog || typeof dialog.showModal !== 'function') return;
  try { if (sessionStorage.getItem(key)) return; } catch (_) {}

  const remember = () => {
    try { sessionStorage.setItem(key, '1'); } catch (_) {}
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
})();
