import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import Home from './pages/Home/Home';

beforeEach(() => {
  fetchMock.resetMocks();
});

afterEach(() => {
  cleanup();
});

describe('Page', () => {
  it('renders the Home component', async () => {
    render(<Home />);
    const homeElement = await screen.getByTestId('home');
    expect(homeElement).toBeInTheDocument();
  });
});
