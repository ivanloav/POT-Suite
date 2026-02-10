import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

const shouldRun = Boolean(email && password);
const describeIf = shouldRun ? describe : describe.skip;

describeIf('Auth flow (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('api');
    await app.init();
    const server = await app.listen(0);
    const address = server.address();
    const port = typeof address === 'string' ? 0 : address?.port;
    if (!port) {
      throw new Error('No se pudo obtener el puerto del servidor de pruebas');
    }
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('login -> refresh -> profile', async () => {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    expect([200, 201]).toContain(loginRes.status);
    const loginJson = await loginRes.json() as { token?: string };
    expect(loginJson.token).toBeDefined();

    const cookies = typeof loginRes.headers.getSetCookie === 'function'
      ? loginRes.headers.getSetCookie()
      : (loginRes.headers.get('set-cookie') || '').split(/,(?=[^;]+?=)/);
    const refreshCookie = cookies.find((c: string) => c.trim().startsWith('refresh_token='));
    expect(refreshCookie).toBeDefined();

    if (!refreshCookie) {
      throw new Error('Missing refresh_token cookie on login');
    }

    const refreshToken = refreshCookie.split(';')[0].split('=')[1];
    if (!refreshToken) {
      throw new Error('Missing refresh_token value on login');
    }

    const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    expect([200, 201]).toContain(refreshRes.status);
    const refreshJson = await refreshRes.json() as { token?: string };
    expect(refreshJson.token).toBeDefined();

    const profileRes = await fetch(`${baseUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${refreshJson.token as string}` },
    });

    expect(profileRes.status).toBe(200);
    const profileJson = await profileRes.json() as { email?: string };
    expect(profileJson.email).toBeDefined();
  });
});
