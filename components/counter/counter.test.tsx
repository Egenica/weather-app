/**
 * @jest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import Counter from './counter';

afterEach(() => {
  cleanup();
});

it('App Router: Works with Client Components (React State)', () => {
  render(<Counter />);
  expect(screen.getByRole('heading')).toHaveTextContent('0');
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('heading')).toHaveTextContent('1');
});
