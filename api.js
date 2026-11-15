/* ===== SakinduStore — Developer API page =====
   API keys (create / revoke), the live package list and the documentation. The API itself runs as a Cloudflare Worker
   (cloudflare-worker/api-worker.js); its address is set in Admin -> API. Access requires an active Reseller Access Key. */

let apiCfg = { baseUrl: '', packages: [] }, apiUser = null, apiNewKey = null;
const apiEsc = t => escHtml(t);

async function renderApi(){
  const root = document.getElementById('apiRoot'); if(!root) return;
  try{ apiCfg = Object.assign({ baseUrl: '', packages: [] }, (await fsGetConfig('api', {})) || {}); }catch(e){}
  const s = getSession();
  const hero = `<section class="rs-hero"><div class="rs-badge">🔌 DEVELOPER API</div><h1>Sakindu <span>API</span></h1>
    <p>ඔබේම website / bot එකෙන් Free Fire Top-ups ස්වයංක්‍රීයව order කරන්න. Sakindu Coins (1 Coin = Rs. 1) වලින් ගෙවේ. Reseller Access Key එක තියෙන අයට API access ඇතුළත්.</p></section>`;
  const base = (apiCfg.baseUrl || '').replace(/\/+$/, '');
  const docs = apiDocsHtml(base);
  if(!s){
    root.innerHTML = hero + `<section class="pf-card" style="text-align:center;padding:28px 18px;"><div style="font-size:2.4rem;">🔐</div><h3 style="margin:8px 0;">Login වෙන්න</h3>
      <p class="pf-muted" style="margin-bottom:14px;">API key හදන්න Sign In / Sign Up වෙන්න.</p><button class="btn btn-primary" onclick="openAuth('login')">Sign In / Sign Up</button></section>` + docs;
    return;
  }
  apiUser = (await fsGetUser(s.phone).catch(() => null)) || {};
  const active = !!(apiUser.resellerUntil && new Date(apiUser.resellerUntil).getTime() > Date.now());
  const keys = await fsGetMyApiKeys(s.phone).catch(() => []);
  const pkgs = (apiCfg.packages || []).filter(p => p && p.id && p.name && Number(p.price) > 0);
  root.innerHTML = hero + `
    ${active ? `<div class="rs-note ok">✅ Reseller access active — ${apiEsc(new Date(apiUser.resellerUntil).toLocaleDateString())} දක්වා. API භාවිත කළ හැක.</div>`
             : `<div class="rs-note warn">⚠️ API භාවිත කරන්න Reseller Access Key එකක් ඕන. <a href="reseller.html" style="color:var(--cyan);font-weight:700;">Reseller Program එකට යන්න →</a></div>`}
    ${apiNewKey ? `<section class="pf-card rs-keybox"><h3>🔑 ඔබේ අලුත් API Key</h3><div class="pf-code" style="font-size:.92rem;word-break:break-all;letter-spacing:.5px;">${apiEsc(apiNewKey)}</div>
      <p class="pf-muted" style="text-align:center;">⚠️ මේ key එක දැන් විතරයි පෙන්වන්නේ. Copy කරලා ආරක්ෂිතව save කරගන්න.</p>
      <button class="btn btn-primary btn-block" onclick="copyText('${apiEsc(apiNewKey)}', this)">📋 Copy key</button></section>` : ''}
    <section class="pf-card">
      <div class="rs-price"><h3>🔑 API Keys</h3><button class="btn btn-primary btn-sm" onclick="apiMakeKey()" ${keys.length >= 3 ? 'disabled' : ''}>＋ New key</button></div>
      <div class="pf-muted" style="margin:6px 0 10px;">උපරිම keys 3ක්. Key එක කාටවත් share කරන්න එපා.</div>
      ${keys.length ? keys.map(k => `<div class="pf-dev"><div class="m">🔑</div><div style="flex:1;min-width:0;"><b style="font-family:monospace;">${apiEsc(k.prefix)}••••••••</b> ${k.active ? '' : '<em style="color:#ff9bb0;font-style:normal;font-size:.72rem;">revoked</em>'}
        <div class="pf-muted">${apiEsc(k.name || '')} · ${apiEsc(new Date(k.createdAt).toLocaleDateString())} · ${k.uses || 0} calls${k.lastUsedAt ? ' · last ' + apiEsc(new Date(k.lastUsedAt).toLocaleString()) : ''}</div></div>
        <button class="btn btn-ghost btn-sm" onclick="apiRevoke('${k._hash}')">Revoke</button></div>`).join('') : '<div class="pf-muted">තවම keys නැහැ.</div>'}
    </section>
    <section class="pf-card"><h3 style="margin-bottom:8px;">📦 API Packages</h3>
      ${pkgs.length ? `<div class="api-table"><table><thead><tr><th>ID</th><th>Package</th><th>Game</th><th>Price</th></tr></thead><tbody>${pkgs.map(p => `<tr><td><code>${apiEsc(p.id)}</code></td><td>${apiEsc(p.name)}${p.note ? `<br><small class="pf-muted">${apiEsc(p.note)}</small>` : ''}</td><td>${apiEsc(p.game || 'Free Fire')}</td><td><b>${Number(p.price).toLocaleString('en-US')} 🪙</b></td></tr>`).join('')}</tbody></table></div>`
        : '<div class="pf-muted">Packages ඉක්මනින් add කරනවා. 🙏</div>'}
    </section>` + docs;
}
async function apiMakeKey(){
  const s = getSession(); if(!s) return;
  const name = prompt('Key එකට නමක් (e.g. My Bot):', 'My key'); if(name === null) return;
  try{ const r = await fsCreateApiKey(s.phone, name.trim().slice(0, 30) || 'My key'); apiNewKey = r.secret; await renderApi(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  catch(e){ alert('❌ ' + (e.message || e)); }
}
async function apiRevoke(hash){
  if(!confirm('මේ key එක revoke කරනවද? (ආයෙ වැඩ කරන්නේ නැහැ)')) return;
  await fsDeleteApiKey(hash); apiNewKey = null; renderApi();
}

function apiDocsHtml(base){
  const B = base || 'https://YOUR-API-URL';
  const ex = (t, c) => `<div class="api-code"><button class="btn btn-ghost btn-sm" onclick="copyText(this.nextElementSibling.textContent, this)">Copy</button><pre>${apiEsc(c)}</pre></div>`;
  return `<section class="pf-card api-docs">
    <h3>📘 Documentation</h3>
    ${base ? `<div class="pf-muted">Base URL</div><div class="pf-code" style="font-size:.9rem;letter-spacing:0;word-break:break-all;">${apiEsc(base)}</div>` : '<div class="rs-note warn">API server එක තවම connect කරලා නැහැ (Admin → API → Base URL).</div>'}
    <h4>Authentication</h4>
    <p class="pf-muted">හැම request එකකම header එකක් ලෙස ඔබේ key එක යවන්න:</p>${ex('', 'X-API-Key: sk_live_xxxxxxxxxxxxxxxxxxxxxxxx')}
    <h4>Response format</h4>${ex('', '{ "success": true,  "data": { ... } }\n{ "success": false, "error": { "code": "insufficient_balance", "message": "..." } }')}

    <h4>GET /v1/balance</h4><p class="pf-muted">Sakindu Coins balance + Reseller access expiry.</p>
    ${ex('', `curl ${B}/v1/balance \\\n  -H "X-API-Key: sk_live_..."\n\n→ { "success": true, "data": { "coins": 1500, "currency": "COINS", "reseller_expires_at": "2026-12-15T..." } }`)}

    <h4>GET /v1/packages</h4><p class="pf-muted">ලබා ගත හැකි packages (price = Coins).</p>
    ${ex('', `curl ${B}/v1/packages -H "X-API-Key: sk_live_..."\n\n→ { "success": true, "data": [ { "id": "ff100", "name": "100 Diamonds", "game": "Free Fire", "price": 80, "currency": "COINS" } ] }`)}

    <h4>POST /v1/verify</h4><p class="pf-muted">Free Fire UID එක live verify කරන්න (nickname, level, region).</p>
    ${ex('', `curl -X POST ${B}/v1/verify \\\n  -H "X-API-Key: sk_live_..." -H "Content-Type: application/json" \\\n  -d '{"uid":"123456789"}'\n\n→ { "success": true, "data": { "uid": "123456789", "nickname": "ProGamer", "level": 61, "region": "SG" } }`)}

    <h4>POST /v1/orders</h4><p class="pf-muted">Order එකක් දාන්න — Coins වලින් ගෙවේ. <code>client_ref</code> (optional) දුන්නොත් එකම ref එකෙන් දෙවතාවක් order වෙන්නේ නැහැ.</p>
    ${ex('', `curl -X POST ${B}/v1/orders \\\n  -H "X-API-Key: sk_live_..." -H "Content-Type: application/json" \\\n  -d '{"package_id":"ff100","uid":"123456789","client_ref":"my-order-1001"}'\n\n→ 201 { "success": true, "data": { "order_id": "api_...", "order_no": "SK261115-AB12", "status": "processing", "price": 80, "balance_after": 1420 } }`)}

    <h4>GET /v1/orders/{order_id} · GET /v1/orders</h4><p class="pf-muted">Order status බලන්න. <code>processing</code> → <code>completed</code> හෝ <code>failed</code> (failed = Coins ස්වයංක්‍රීයව refund).</p>
    ${ex('', `curl ${B}/v1/orders/api_xxxxxxxx -H "X-API-Key: sk_live_..."\ncurl "${B}/v1/orders?limit=20" -H "X-API-Key: sk_live_..."`)}

    <h4>Error codes</h4>
    <div class="api-table"><table><tbody>
      <tr><td><code>401 invalid_api_key</code></td><td>Key නැහැ / වැරදියි / revoke කරලා</td></tr>
      <tr><td><code>403 reseller_access_required</code></td><td>Reseller Access Key එක expire වෙලා</td></tr>
      <tr><td><code>402 insufficient_balance</code></td><td>Coins මදි</td></tr>
      <tr><td><code>404 package_not_found / uid_not_found</code></td><td>package_id හෝ UID එක වැරදියි</td></tr>
      <tr><td><code>400 invalid_uid</code></td><td>UID එක ඉලක්කම් 8–12ක් විය යුතුයි</td></tr>
      <tr><td><code>429 rate_limited</code></td><td>විනාඩියකට requests 60ක් උපරිමය</td></tr>
    </tbody></table></div>
    <h4>Python example</h4>
    ${ex('', `import requests\nAPI = "${B}"\nH = {"X-API-Key": "sk_live_..."}\n\nr = requests.post(API + "/v1/orders", headers=H,\n    json={"package_id": "ff100", "uid": "123456789", "client_ref": "order-1001"})\nprint(r.json())`)}
  </section>`;
}
function onProfileLogin(){ renderApi(); }
