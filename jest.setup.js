// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'mock-local-storage';

if (!global.window) {
  global.window = Object.create(window);
  global.window.__NEXT_DATA__ = {
    props: {},
    page: '',
    query: {},
    buildId: '',
  };
  global.window.name = '';
}

Object.defineProperty(window, 'sessionStorage', { value: global.sessionStorage });
Object.defineProperty(window, 'localStorage', { value: global.localStorage });
