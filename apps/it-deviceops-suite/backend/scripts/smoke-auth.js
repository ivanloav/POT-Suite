const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const EMAIL = process.env.SMOKE_EMAIL;
const PASSWORD = process.env.SMOKE_PASSWORD;

const fail = (message) => {
  console.error(`[smoke-auth] ${message}`);
  process.exit(1);
};

const getRefreshCookie = (headers) => {
  let cookies = [];
  if (headers && typeof headers.getSetCookie === 'function') {
    cookies = headers.getSetCookie();
  } else {
    const setCookieHeader = headers?.get?.('set-cookie');
    if (setCookieHeader) {
      cookies = setCookieHeader.split(/,(?=[^;]+?=)/);
    }
  }

  for (const cookie of cookies) {
    const pair = cookie.split(';')[0].trim();
    if (pair.startsWith('refresh_token=')) {
      const value = pair.slice('refresh_token='.length);
      if (value) {
        return pair;
      }
    }
  }
  return null;
};

const main = async () => {
  if (!EMAIL || !PASSWORD) {
    fail('Missing SMOKE_EMAIL or SMOKE_PASSWORD env vars');
  }

  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!loginRes.ok) {
    fail(`Login failed with status ${loginRes.status}`);
  }

  const refreshCookie = getRefreshCookie(loginRes.headers);
  if (!refreshCookie || !refreshCookie.startsWith('refresh_token=')) {
    fail('Missing refresh_token cookie on login');
  }

  const loginJson = await loginRes.json();
  if (!loginJson.token) {
    fail('Missing token in login response');
  }

  const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': refreshCookie,
    },
  });

  if (!refreshRes.ok) {
    fail(`Refresh failed with status ${refreshRes.status}`);
  }

  const refreshJson = await refreshRes.json();
  if (!refreshJson.token) {
    fail('Missing token in refresh response');
  }

  const profileRes = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${refreshJson.token}` },
  });

  if (!profileRes.ok) {
    fail(`Profile failed with status ${profileRes.status}`);
  }

  console.log('[smoke-auth] OK');
};

main().catch((err) => fail(err?.message || 'Unexpected error'));
