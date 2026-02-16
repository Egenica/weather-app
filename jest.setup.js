// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'mock-local-storage';

if (typeof global.Request === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = new Map(Object.entries(init));
    }

    get(key) {
      return this.map.get(key.toLowerCase()) || null;
    }

    set(key, value) {
      this.map.set(key.toLowerCase(), value);
    }
  };

  global.Request = class Request {
    constructor(url, init = {}) {
      this.url = url;
      this.method = init.method || 'GET';
      this.headers = new global.Headers(init.headers || {});
      this.body = init.body;
    }
  };

  global.Response = class Response {
    constructor(body = null, init = {}) {
      this._body = body;
      this.status = init.status || 200;
      this.headers = new global.Headers(init.headers || {});
    }

    async json() {
      if (typeof this._body === 'string') {
        return JSON.parse(this._body);
      }

      return this._body;
    }

    async text() {
      return typeof this._body === 'string' ? this._body : JSON.stringify(this._body ?? '');
    }

    static json(body, init = {}) {
      const headers = {
        'content-type': 'application/json',
        ...(init.headers || {}),
      };

      return new Response(JSON.stringify(body), {
        ...init,
        headers,
      });
    }
  };
}

if (typeof window !== 'undefined' && !global.window) {
  global.window = Object.create(window);
  global.window.__NEXT_DATA__ = {
    props: {},
    page: '',
    query: {},
    buildId: '',
  };
  global.window.name = '';
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'sessionStorage', { value: global.sessionStorage });
  Object.defineProperty(window, 'localStorage', { value: global.localStorage });
}
