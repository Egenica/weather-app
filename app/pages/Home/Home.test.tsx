import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import Home from './Home';

beforeEach(() => {
  fetchMock.resetMocks();
});

afterEach(() => {
  cleanup();
});

describe('Home', () => {
  beforeEach(() => {
    fetchMock.mockResponse(JSON.stringify({ locations: [] }));
  });

  it('renders the MiniNav component', () => {
    render(<Home />);
    const miniNavElement = screen.getByTestId('mini-nav');
    expect(miniNavElement).toBeInTheDocument();
  });

  it('renders the WeatherSearch component', () => {
    render(<Home />);
    const weatherSearchElement = screen.getByTestId('weather-search');
    expect(weatherSearchElement).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<Home />);
    const titleElement = screen.getByText(/Find your weather location/i);
    expect(titleElement).toBeInTheDocument();
  });
});
