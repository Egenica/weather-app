import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import Page from './page';

beforeEach(() => {
  fetchMock.resetMocks();
});

afterEach(() => {
  cleanup();
});

describe('Page', () => {
  it('renders the MiniNav component', () => {
    render(<Page />);
    const miniNavElement = screen.getByTestId('mini-nav');
    expect(miniNavElement).toBeInTheDocument();
  });

  it('renders the WeatherSearch component', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: '12345' }));
    render(<Page />);
    const weatherSearchElement = screen.getByTestId('weather-search');
    expect(weatherSearchElement).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<Page />);
    const titleElement = screen.getByText(/Find your weather location/i);
    expect(titleElement).toBeInTheDocument();
  });
});
