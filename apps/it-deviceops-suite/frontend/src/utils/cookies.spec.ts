import { cookies } from './cookies';

describe('cookies', () => {
  beforeEach(() => {
    document.cookie = 'test=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  });

  it('sets and gets a cookie', () => {
    cookies.set('test', 'value', 1);
    expect(cookies.get('test')).toBe('value');
  });

  it('removes a cookie', () => {
    cookies.set('test', 'value', 1);
    cookies.remove('test');
    expect(cookies.get('test')).toBeNull();
  });
});
