/* Lightweight store-closed overlay check for pages that don't load the full app.js.
   Requires firebase-init.js + db.js loaded first. */
(async function(){
  const overlay = document.getElementById('storeLockOverlay');
  if(!overlay) return;
  try{
    const store = await fsGetConfig('store', { closed:false, announcement:'' });
    if(store.closed){
      const ic = overlay.querySelector('.lock-ic');
      if(ic && !ic.querySelector('.mt-scene')) ic.innerHTML = `<svg class="mt-scene" viewBox="0 0 260 170" aria-hidden="true">
  <defs>
    <linearGradient id="mtG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd86b"/><stop offset="1" stop-color="#ff9f1c"/></linearGradient>
    <linearGradient id="mtM" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dfe7f7"/><stop offset="1" stop-color="#8793b3"/></linearGradient>
  </defs>
  <g class="mt-gear"><path d="M166.8 75.7 L175.9 76.6 L175.9 83.4 L166.8 84.3 L164.0 94.7 L171.4 100.0 L168.0 105.9 L159.7 102.1 L152.1 109.7 L155.9 118.0 L150.0 121.4 L144.7 114.0 L134.3 116.8 L133.4 125.9 L126.6 125.9 L125.7 116.8 L115.3 114.0 L110.0 121.4 L104.1 118.0 L107.9 109.7 L100.3 102.1 L92.0 105.9 L88.6 100.0 L96.0 94.7 L93.2 84.3 L84.1 83.4 L84.1 76.6 L93.2 75.7 L96.0 65.3 L88.6 60.0 L92.0 54.1 L100.3 57.9 L107.9 50.3 L104.1 42.0 L110.0 38.6 L115.3 46.0 L125.7 43.2 L126.6 34.1 L133.4 34.1 L134.3 43.2 L144.7 46.0 L150.0 38.6 L155.9 42.0 L152.1 50.3 L159.7 57.9 L168.0 54.1 L171.4 60.0 L164.0 65.3Z" fill="url(#mtG)" fill-rule="evenodd" stroke="#b36b00" stroke-width="1.5"/><circle cx="130" cy="80" r="15" fill="#0b1020" stroke="#b36b00" stroke-width="2"/><circle cx="130" cy="80" r="6" fill="url(#mtG)"/></g>
  <g class="mt-hammer"><rect x="46" y="58" width="8" height="88" rx="4" fill="#b9733a" stroke="#6e3f17"/><rect x="26" y="40" width="48" height="24" rx="5" fill="url(#mtM)" stroke="#59638a" stroke-width="1.5"/><rect x="26" y="40" width="10" height="24" rx="4" fill="#59638a" opacity=".5"/></g>
  <g class="mt-sickle"><rect x="206" y="68" width="8" height="78" rx="4" fill="#b9733a" stroke="#6e3f17"/><path d="M210 70 C 212 26, 168 12, 150 40 C 168 32, 190 40, 198 66 Z" fill="url(#mtM)" stroke="#59638a" stroke-width="1.5" stroke-linejoin="round"/></g>
</svg>`;
      overlay.classList.add('show');
    }
  } catch(e){ console.error('store-check', e); }
})();
