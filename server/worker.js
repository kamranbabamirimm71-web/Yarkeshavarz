/**
 * YarKeshavarz secure API foundation for Cloudflare Workers + D1.
 * This is a deployment scaffold, not an active production backend until configured,
 * tested, and connected to a real authentication and payment provider.
 */
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const PLANS = {
  economic: { code: 'economic', name: 'اقتصادی', chatMonthly: 120, visionMonthly: 15 },
  professional: { code: 'professional', name: 'حرفه‌ای', chatMonthly: 600, visionMonthly: 100 }
};

function reply(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });
}
function id(prefix = 'id') { return `${prefix}_${crypto.randomUUID()}`; }
function monthKey() { return new Date().toISOString().slice(0, 7); }
function nowIso() { return new Date().toISOString(); }
function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  const headers = { 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'Content-Type,Authorization,X-Admin-Secret', 'vary': 'Origin' };
  if (allowed.includes(origin)) headers['access-control-allow-origin'] = origin;
  return headers;
}
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function authenticate(request, env) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token || !env.DB) return null;
  const hash = await sha256(token);
  return env.DB.prepare(`SELECT u.id,u.phone,u.email,u.display_name,u.role
    FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>? AND u.disabled_at IS NULL`)
    .bind(hash, nowIso()).first();
}
async function activeSubscription(env, userId) {
  return env.DB.prepare(`SELECT * FROM subscriptions WHERE user_id=? AND status='active'
    AND starts_at<=? AND ends_at>? ORDER BY ends_at DESC LIMIT 1`)
    .bind(userId, nowIso(), nowIso()).first();
}
async function usage(env, userId) {
  return (await env.DB.prepare('SELECT * FROM usage_monthly WHERE user_id=? AND month_key=?')
    .bind(userId, monthKey()).first()) || { user_id: userId, month_key: monthKey(), chat_count: 0, vision_count: 0 };
}
async function ensureUsage(env, userId) {
  await env.DB.prepare(`INSERT OR IGNORE INTO usage_monthly(user_id,month_key) VALUES(?,?)`)
    .bind(userId, monthKey()).run();
}
async function logUsage(env, userId, kind, model, status, durationMs, requestId) {
  await env.DB.prepare(`INSERT INTO ai_usage_log(id,user_id,kind,model,status,duration_ms,provider_request_id)
    VALUES(?,?,?,?,?,?,?)`).bind(id('usage'), userId, kind, model, status, durationMs ?? null, requestId ?? null).run();
}
function limitsFor(sub) { return PLANS[sub.plan_code] || null; }
async function checkEntitlement(request, env, kind) {
  const user = await authenticate(request, env);
  if (!user) return { error: reply({ error: 'AUTH_REQUIRED', message: 'برای استفاده آنلاین باید وارد حساب کاربری شوید.' }, 401) };
  if (user.role !== 'admin') {
    const sub = await activeSubscription(env, user.id);
    if (!sub) return { error: reply({ error: 'SUBSCRIPTION_REQUIRED', message: 'اشتراک آنلاین فعال ندارید.' }, 402) };
    const limits = limitsFor(sub);
    if (!limits) return { error: reply({ error: 'INVALID_PLAN', message: 'طرح اشتراک معتبر نیست.' }, 403) };
    await ensureUsage(env, user.id);
    const current = await usage(env, user.id);
    const used = kind === 'vision' ? current.vision_count : current.chat_count;
    const limit = kind === 'vision' ? limits.visionMonthly : limits.chatMonthly;
    if (used >= limit) return { error: reply({ error: 'QUOTA_EXCEEDED', message: 'سهمیه این بخش برای این ماه تمام شده است.', plan: sub.plan_code, used, limit }, 429) };
    return { user, sub, limits, current, used, limit };
  }
  await ensureUsage(env, user.id);
  return { user, sub: { plan_code: 'professional' }, limits: { chatMonthly: 999999, visionMonthly: 999999 }, current: await usage(env, user.id), used: 0, limit: 999999 };
}
async function callVisionProvider(env, question, dataUrl, mimeType) {
  if (!env.AI_BASE_URL || !env.AI_API_KEY || !env.AI_MODEL_VISION) throw new Error('AI_PROVIDER_NOT_CONFIGURED');
  const base = env.AI_BASE_URL.replace(/\/+$/, '');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.AI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env.AI_MODEL_VISION,
      messages: [
        { role: 'system', content: 'تو مشاور کشاورزی هستی. به فارسی پاسخ بده. از روی تصویر فقط نشانه‌های قابل مشاهده را توصیف کن؛ تشخیص قطعی ادعا نکن. علت‌های احتمالی، اطلاعات تکمیلی مورد نیاز و اقدامات کم‌خطر را جدا کن. درباره مصرف سم یا دوز آن بدون شواهد کافی توصیه قطعی نده. اگر تصویر برای تشخیص کافی نیست، صریحاً بگو.' },
        { role: 'user', content: [ { type: 'text', text: question }, { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } } ] }
      ], max_tokens: 900, temperature: 0.2
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`AI_PROVIDER_HTTP_${response.status}`);
  const answer = body?.choices?.[0]?.message?.content;
  if (typeof answer !== 'string' || !answer.trim()) throw new Error('AI_EMPTY_RESPONSE');
  return { answer: answer.trim(), requestId: response.headers.get('x-request-id') || body.id || null };
}
async function callTextProvider(env, question) {
  if (!env.AI_BASE_URL || !env.AI_API_KEY || !env.AI_MODEL_TEXT) throw new Error('AI_PROVIDER_NOT_CONFIGURED');
  const base = env.AI_BASE_URL.replace(/\/+$/, '');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST', headers: { authorization: `Bearer ${env.AI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: env.AI_MODEL_TEXT, messages: [
      { role: 'system', content: 'تو مشاور کشاورزی فارسی‌زبان هستی. پاسخ کاربردی و روشن بده، عدم قطعیت را توضیح بده و بدون اطلاعات کافی نسخه قطعی سم یا کود صادر نکن.' },
      { role: 'user', content: question }
    ], max_tokens: 800, temperature: 0.3 })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`AI_PROVIDER_HTTP_${response.status}`);
  const answer = body?.choices?.[0]?.message?.content;
  if (typeof answer !== 'string' || !answer.trim()) throw new Error('AI_EMPTY_RESPONSE');
  return { answer: answer.trim(), requestId: response.headers.get('x-request-id') || body.id || null };
}
async function handleAI(request, env, kind) {
  const entitlement = await checkEntitlement(request, env, kind);
  if (entitlement.error) return entitlement.error;
  let payload;
  try { payload = await request.json(); } catch { return reply({ error: 'INVALID_JSON' }, 400); }
  const question = String(payload.question || '').trim();
  if (!question || question.length > 5000) return reply({ error: 'INVALID_QUESTION', message: 'متن سؤال الزامی است و باید کمتر از ۵۰۰۰ نویسه باشد.' }, 400);
  let dataUrl = '', mimeType = '';
  if (kind === 'vision') {
    dataUrl = String(payload.imageDataUrl || '');
    const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/i);
    if (!match) return reply({ error: 'INVALID_IMAGE', message: 'تصویر باید JPG، PNG، WEBP یا GIF معتبر باشد.' }, 400);
    mimeType = match[1].toLowerCase();
    if (match[2].length > 8 * 1024 * 1024) return reply({ error: 'IMAGE_TOO_LARGE', message: 'حجم تصویر بیش از حد مجاز است؛ تصویر کوچک‌تری بفرستید.' }, 413);
  }
  const started = Date.now();
  try {
    const result = kind === 'vision' ? await callVisionProvider(env, question, dataUrl, mimeType) : await callTextProvider(env, question);
    const field = kind === 'vision' ? 'vision_count' : 'chat_count';
    await env.DB.prepare(`UPDATE usage_monthly SET ${field}=${field}+1,updated_at=? WHERE user_id=? AND month_key=?`)
      .bind(nowIso(), entitlement.user.id, monthKey()).run();
    await logUsage(env, entitlement.user.id, kind, kind === 'vision' ? env.AI_MODEL_VISION : env.AI_MODEL_TEXT, 'success', Date.now() - started, result.requestId);
    return reply({ answer: result.answer, usage: { kind, used: entitlement.used + 1, limit: entitlement.limit, month: monthKey() } });
  } catch (error) {
    const code = String(error?.message || 'AI_PROVIDER_ERROR');
    await logUsage(env, entitlement.user.id, kind, kind === 'vision' ? (env.AI_MODEL_VISION || 'unset') : (env.AI_MODEL_TEXT || 'unset'), 'error', Date.now() - started, null).catch(() => {});
    if (code === 'AI_PROVIDER_NOT_CONFIGURED') return reply({ error: code, message: 'سرویس هوش مصنوعی هنوز در سرور پیکربندی نشده است.' }, 503);
    return reply({ error: 'AI_PROVIDER_ERROR', message: 'ارتباط با سرویس هوش مصنوعی ناموفق بود. بعداً دوباره تلاش کنید.' }, 502);
  }
}
async function adminAuthorized(request, env) {
  const given = request.headers.get('X-Admin-Secret') || '';
  return !!env.ADMIN_SECRET && given.length > 0 && given === env.ADMIN_SECRET;
}
async function adminCreateUser(request, env) {
  if (!await adminAuthorized(request, env)) return reply({ error: 'FORBIDDEN' }, 403);
  let p; try { p = await request.json(); } catch { return reply({ error: 'INVALID_JSON' }, 400); }
  const phone = String(p.phone || '').trim() || null;
  const email = String(p.email || '').trim().toLowerCase() || null;
  const displayName = String(p.displayName || '').trim().slice(0, 120);
  if (!phone && !email) return reply({ error: 'PHONE_OR_EMAIL_REQUIRED' }, 400);
  const userId = id('user');
  const token = `yk_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  try {
    await env.DB.prepare('INSERT INTO users(id,phone,email,display_name) VALUES(?,?,?,?)').bind(userId, phone, email, displayName).run();
    await env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(tokenHash, userId, expiresAt).run();
  } catch (e) { return reply({ error: 'USER_CREATE_FAILED', message: 'کاربر ساخته نشد؛ شماره یا ایمیل ممکن است تکراری باشد.' }, 409); }
  return reply({ userId, sessionToken: token, expiresAt, warning: 'این توکن فقط یک بار نمایش داده می‌شود؛ در پیاده‌سازی نهایی ورود امن با OTP جایگزین شود.' }, 201);
}
async function adminSetSubscription(request, env) {
  if (!await adminAuthorized(request, env)) return reply({ error: 'FORBIDDEN' }, 403);
  let p; try { p = await request.json(); } catch { return reply({ error: 'INVALID_JSON' }, 400); }
  const userId = String(p.userId || '');
  const planCode = String(p.planCode || '');
  const days = Number(p.days || 30);
  if (!userId || !PLANS[planCode] || !Number.isInteger(days) || days < 1 || days > 366) return reply({ error: 'INVALID_SUBSCRIPTION' }, 400);
  const user = await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(userId).first();
  if (!user) return reply({ error: 'USER_NOT_FOUND' }, 404);
  const starts = nowIso();
  const ends = new Date(Date.now() + days * 86400000).toISOString();
  await env.DB.prepare("UPDATE subscriptions SET status='expired',updated_at=? WHERE user_id=? AND status='active'") .bind(starts, userId).run();
  const subId = id('sub');
  await env.DB.prepare(`INSERT INTO subscriptions(id,user_id,plan_code,status,starts_at,ends_at,payment_provider,payment_reference)
    VALUES(?,?,?,'active',?,?,?,?)`).bind(subId,userId,planCode,starts,ends,String(p.paymentProvider || 'manual-admin'),p.paymentReference ? String(p.paymentReference) : null).run();
  return reply({ subscriptionId: subId, userId, planCode, status: 'active', startsAt: starts, endsAt: ends, note: 'فعال‌سازی دستی مدیریتی است؛ قبل از فروش واقعی باید به وب‌هوک تأییدشده درگاه پرداخت وصل شود.' }, 201);
}
async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  const url = new URL(request.url);
  let response;
  if (request.method === 'GET' && url.pathname === '/health') {
    response = reply({ ok: true, service: 'YarKeshavarz API foundation', configured: { database: !!env.DB, aiProvider: !!(env.AI_BASE_URL && env.AI_API_KEY && env.AI_MODEL_TEXT && env.AI_MODEL_VISION), auth: true, paymentWebhook: false } });
  } else if (request.method === 'GET' && url.pathname === '/api/plans') {
    response = reply({ plans: Object.values(PLANS), billing: 'monthly usage quotas; prices intentionally unset until cost review' });
  } else if (request.method === 'GET' && url.pathname === '/api/me') {
    const user = await authenticate(request, env);
    if (!user) response = reply({ error: 'AUTH_REQUIRED' }, 401);
    else {
      const sub = await activeSubscription(env, user.id);
      const u = await usage(env, user.id);
      const limits = sub ? limitsFor(sub) : null;
      response = reply({ user, subscription: sub || null, usage: { month: monthKey(), chat: u.chat_count, vision: u.vision_count }, limits });
    }
  } else if (request.method === 'POST' && url.pathname === '/api/ai/chat') {
    response = await handleAI(request, env, 'chat');
  } else if (request.method === 'POST' && url.pathname === '/api/ai/vision') {
    response = await handleAI(request, env, 'vision');
  } else if (request.method === 'POST' && url.pathname === '/api/admin/create-user') {
    response = await adminCreateUser(request, env);
  } else if (request.method === 'POST' && url.pathname === '/api/admin/set-subscription') {
    response = await adminSetSubscription(request, env);
  } else {
    response = reply({ error: 'NOT_FOUND' }, 404);
  }
  const headers = corsHeaders(request, env);
  const h = new Headers(response.headers);
  for (const [k, v] of Object.entries(headers)) h.set(k, v);
  return new Response(response.body, { status: response.status, headers: h });
}
export default { fetch: handleRequest };
