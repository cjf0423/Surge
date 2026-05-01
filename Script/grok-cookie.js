// Surge iOS/macOS script: Capture Grok cookie/token for Grok2API + BoxJs
// BoxJs keys:
//   grok2api.tokens       newline-separated selected tokens; new accounts appended
//   grok2api.last_token   latest selected token
//   grok2api.last_cookie  latest full Cookie header
//   grok2api.cookie_names latest Cookie names for debugging
//   grok2api.debug        latest debug info
//
// iOS Surge module example:
// [Script]
// Grok Cookie Capture = type=http-request,pattern=^https?:\/\/(?:www\.)?(?:grok\.com|x\.com|xai\.com)\/.*,requires-body=false,max-size=0,script-path=surge-grok-cookie.js
// Grok Cookie Viewer = type=http-request,pattern=^http:\/\/grok-cookie\.local\/.*,requires-body=false,max-size=0,script-path=surge-grok-cookie.js
//
// [MITM]
// hostname = %APPEND% grok.com, www.grok.com, x.com, www.x.com, xai.com, www.xai.com

const STORE_KEY = "grok2api.cookie.capture.v1";
const BOXJS_TOKEN_LIST_KEY = "grok2api.tokens";
const BOXJS_LAST_TOKEN_KEY = "grok2api.last_token";
const BOXJS_LAST_COOKIE_KEY = "grok2api.last_cookie";
const BOXJS_COOKIE_NAMES_KEY = "grok2api.cookie_names";
const BOXJS_DEBUG_KEY = "grok2api.debug";

// Normal mode: only notify after a target token is captured.
// Set to true temporarily if you need debugging notifications.
const DEBUG_NOTIFY = false;

function nowISO() {
  return new Date().toISOString();
}

function notify(title, subtitle, body) {
  try {
    if (typeof $notification !== "undefined" && $notification.post) {
      $notification.post(String(title || ""), String(subtitle || ""), String(body || ""));
    }
  } catch (_) {}
}

function getHeader(headers, name) {
  if (!headers) return "";
  const lower = String(name).toLowerCase();
  for (const k in headers) {
    if (String(k).toLowerCase() === lower) return headers[k];
  }
  return "";
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  const parts = String(cookieHeader).split(";");
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) out[name] = value;
  }
  return out;
}

function cookieNames(cookies) {
  const names = [];
  for (const k in cookies) names.push(k);
  return names;
}

function pickGrokTokens(cookies) {
  const picked = {};
  // Known/common Grok/xAI session cookie names. Case-insensitive matching below.
  const wantedLower = {
    "sso": true,
    "ssorw": true,
    "sso-rw": true,
    "sso_rw": true,
    "ssobasic": true,
    "sso-basic": true,
    "sso_basic": true,
    "x-anonymous-user-id": true,
    "x-user-id": true
  };
  for (const name in cookies) {
    const lower = String(name).toLowerCase();
    if (wantedLower[lower]) picked[name] = cookies[name];
  }
  return picked;
}

function values(obj) {
  const arr = [];
  for (const k in obj) arr.push(obj[k]);
  return arr;
}

function mask(s) {
  s = String(s || "");
  if (!s) return "";
  if (s.length <= 12) return s;
  return s.slice(0, 6) + "…" + s.slice(-6);
}

function chooseTokenValue(tokens) {
  const priorityLower = [
    "ssorw", "sso-rw", "sso_rw",
    "sso",
    "ssobasic", "sso-basic", "sso_basic"
  ];
  for (let i = 0; i < priorityLower.length; i++) {
    const want = priorityLower[i];
    for (const name in tokens) {
      if (String(name).toLowerCase() === want && tokens[name]) return tokens[name];
    }
  }
  const arr = values(tokens);
  return arr.length ? arr[0] : "";
}

function readTokenList() {
  const raw = $persistentStore.read(BOXJS_TOKEN_LIST_KEY) || "";
  return String(raw).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

function saveTokenToBoxJs(token, cookie) {
  if (!token) return { added: false, count: readTokenList().length };
  const list = readTokenList();
  let exists = false;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === token) { exists = true; break; }
  }
  if (!exists) list.push(token);
  $persistentStore.write(list.join("\n"), BOXJS_TOKEN_LIST_KEY);
  $persistentStore.write(token, BOXJS_LAST_TOKEN_KEY);
  if (cookie) $persistentStore.write(cookie, BOXJS_LAST_COOKIE_KEY);
  return { added: !exists, count: list.length };
}

function htmlEscape(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function respondHTML(body) {
  $done({
    response: {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      body: body
    }
  });
}

function viewPage() {
  const url = $request.url || "";
  if (url.indexOf("clear=1") >= 0) {
    $persistentStore.write("", STORE_KEY);
    $persistentStore.write("", BOXJS_TOKEN_LIST_KEY);
    $persistentStore.write("", BOXJS_LAST_TOKEN_KEY);
    $persistentStore.write("", BOXJS_LAST_COOKIE_KEY);
    $persistentStore.write("", BOXJS_COOKIE_NAMES_KEY);
    $persistentStore.write("", BOXJS_DEBUG_KEY);
    return respondHTML('<meta name="viewport" content="width=device-width,initial-scale=1"><h2>已清除 Grok Cookie / BoxJs Token 缓存</h2><p><a href="/">返回</a></p>');
  }

  let data = null;
  try { data = JSON.parse($persistentStore.read(STORE_KEY) || "null"); } catch (_) {}

  const boxTokenList = $persistentStore.read(BOXJS_TOKEN_LIST_KEY) || "";
  const lastToken = $persistentStore.read(BOXJS_LAST_TOKEN_KEY) || "";
  const cookieNamesText = $persistentStore.read(BOXJS_COOKIE_NAMES_KEY) || "";
  const debug = $persistentStore.read(BOXJS_DEBUG_KEY) || "";
  const boxCount = readTokenList().length;

  if (!data || !data.tokens || Object.keys(data.tokens).length === 0) {
    return respondHTML(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
      <style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:20px;line-height:1.5;max-width:900px;margin:auto}pre{background:#f5f5f5;padding:10px;border-radius:8px;white-space:pre-wrap;word-break:break-all}</style>
      <h2>还没有捕获到 Grok Token</h2>
      <p>如果这里有 Cookie 名称，说明脚本已触发但没找到 SSO/SSORW/SSOBASIC。</p>
      <h3>BoxJs 键名</h3><pre>${BOXJS_TOKEN_LIST_KEY}</pre>
      <h3>最新 Cookie 名称</h3><pre>${htmlEscape(cookieNamesText)}</pre>
      <h3>Debug</h3><pre>${htmlEscape(debug)}</pre>
      <ol>
        <li>确认 iOS 模块里的 script-path 是手机本地文件名或 URL，不要用 Mac 的 /Users/... 路径。</li>
        <li>确认 MITM hostname 包含 grok.com, www.grok.com。</li>
        <li>确认 Surge 已信任 MitM 证书。</li>
        <li>打开 https://grok.com 并重新登录一次。</li>
      </ol>`);
  }

  const tokenLines = Object.keys(data.tokens).map(k => `${k}=${data.tokens[k]}`).join("\n");
  const cookieLine = Object.keys(data.tokens).map(k => `${k}=${data.tokens[k]}`).join("; ");
  const allCookie = data.cookie || "";
  const chosenToken = data.chosenToken || chooseTokenValue(data.tokens);

  return respondHTML(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:20px;line-height:1.5;max-width:900px;margin:auto}pre{background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap;word-break:break-all}button{font-size:16px;padding:8px 12px;margin:4px 0}.warn{color:#b00020}</style>
    <h2>Grok Token 已捕获</h2>
    <p>来源：${htmlEscape(data.url)}<br>时间：${htmlEscape(data.time)}</p>
    <p class="warn">这是登录凭证，等同账号权限，不要发给别人。</p>
    <h3>BoxJs 多账号 Token 列表</h3>
    <p>BoxJs 键名：<b>${BOXJS_TOKEN_LIST_KEY}</b>，当前共 <b>${boxCount}</b> 个账号。</p>
    <pre id="boxTokens">${htmlEscape(boxTokenList)}</pre>
    <button onclick="navigator.clipboard.writeText(document.getElementById('boxTokens').innerText)">复制 BoxJs 多账号列表</button>
    <h3>本次选中的单个 Token 值</h3>
    <pre id="chosenToken">${htmlEscape(chosenToken || lastToken)}</pre>
    <button onclick="navigator.clipboard.writeText(document.getElementById('chosenToken').innerText)">复制本次 Token</button>
    <h3>捕获到的 Token 明细</h3><pre>${htmlEscape(tokenLines)}</pre>
    <h3>Cookie 片段</h3><pre>${htmlEscape(cookieLine)}</pre>
    <h3>完整 Cookie Header</h3><pre>${htmlEscape(allCookie)}</pre>
    <h3>Cookie 名称</h3><pre>${htmlEscape(cookieNamesText)}</pre>
    <h3>Debug</h3><pre>${htmlEscape(debug)}</pre>
    <p><a href="/?clear=1">清除本地缓存</a></p>`);
}

try {
  const reqUrl = $request.url || "";

  if (/^http:\/\/grok-cookie\.local\//i.test(reqUrl) || /^http:\/\/grok-cookie\.local$/i.test(reqUrl)) {
    viewPage();
  } else {
    const cookie = getHeader($request.headers, "Cookie");
    const cookies = parseCookies(cookie);
    const names = cookieNames(cookies);
    const tokens = pickGrokTokens(cookies);
    const debug = [
      `time=${nowISO()}`,
      `url=${reqUrl}`,
      `has_cookie=${cookie ? "yes" : "no"}`,
      `cookie_names=${names.join(", ") || "none"}`,
      `token_names=${Object.keys(tokens).join(", ") || "none"}`
    ].join("\n");

    $persistentStore.write(names.join("\n"), BOXJS_COOKIE_NAMES_KEY);
    $persistentStore.write(debug, BOXJS_DEBUG_KEY);

    if (cookie && Object.keys(tokens).length > 0) {
      const chosenToken = chooseTokenValue(tokens);
      const box = saveTokenToBoxJs(chosenToken, cookie);
      const data = { time: nowISO(), url: reqUrl, tokens: tokens, chosenToken: chosenToken, cookie: cookie, box: box, cookieNames: names };
      $persistentStore.write(JSON.stringify(data), STORE_KEY);
      // Keep quiet for repeated/existing tokens. Notify only when a new token/account is added.
      if (box.added) {
        notify("Grok 新 Token 已存入 BoxJs", "新账号已追加", `变量: ${BOXJS_TOKEN_LIST_KEY}\n账号数: ${box.count}\nToken: ${mask(chosenToken)}`);
      }
    } else if (DEBUG_NOTIFY) {
      notify("Grok 脚本已触发，但没找到 Token", cookie ? "已看到 Cookie，但名称不匹配" : "请求里没有 Cookie", `Cookie名: ${names.join(", ") || "none"}\n打开 http://grok-cookie.local/ 看 debug`);
    }

    $done({});
  }
} catch (e) {
  notify("Grok Cookie 脚本错误", String(e), "");
  try { $persistentStore.write(`error=${String(e)}\ntime=${nowISO()}`, BOXJS_DEBUG_KEY); } catch (_) {}
  $done({});
}
