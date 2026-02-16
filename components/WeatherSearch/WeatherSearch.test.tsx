import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import WeatherSearch from './WeatherSearch';

beforeEach(() => {
  fetchMock.resetMocks();
  fetchMock.mockResponseOnce(
    JSON.stringify({
      locations: [{ adminArea: 'England', country: 'United Kingdom', lat: 53.8, lon: -1.5, name: 'Leeds' }],
    }),
  );
});

afterEach(() => {
  fetchMock.resetMocks();
  cleanup();
});

describe('WeatherSearch', () => {
  it('renders without crashing', () => {
    render(<WeatherSearch setLocation={jest.fn()} />);
    const inputElement = screen.getByPlaceholderText('Search locations...');
    expect(inputElement).toBeInTheDocument();
  });

  it('filters locations based on search input', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        locations: [{ adminArea: 'England', country: 'United Kingdom', lat: 60.4, lon: -1.3, name: 'Scatsta' }],
      }),
    );

    render(<WeatherSearch setLocation={jest.fn()} />);
    const inputElement = screen.getByTestId('search-input');

    fireEvent.change(inputElement, { target: { value: 'Scatsta' } });

    await waitFor(
      () => {
        const scrollAreaElement = screen.getByTestId('scroll-area');

        expect(scrollAreaElement).toBeInTheDocument();

        const filteredLocation = screen.getByText(/Scatsta/i);
        expect(filteredLocation).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('counts the number of items returned', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        locations: [
          { adminArea: 'England', country: 'United Kingdom', lat: 53.8, lon: -1.5, name: 'Leeds' },
          { adminArea: 'England', country: 'United Kingdom', lat: 53.7, lon: -1.4, name: 'Leeds Bradford' },
        ],
      }),
    );

    render(<WeatherSearch setLocation={jest.fn()} />);
    const inputElement = screen.getByTestId('search-input');

    fireEvent.change(inputElement, { target: { value: 'Lee' } });

    await waitFor(
      () => {
        const scrollAreaElement = screen.getByTestId('scroll-area');

        expect(scrollAreaElement).toBeInTheDocument();

        const items = scrollAreaElement.querySelectorAll('li');

        expect(items.length).toEqual(2);
      },
      { timeout: 5000 },
    );
  });

  it('keeps fallback locations when query is shorter than 2 characters', async () => {
    render(<WeatherSearch setLocation={jest.fn()} />);
    const inputElement = screen.getByPlaceholderText('Search locations...');

    fireEvent.change(inputElement, { target: { value: 'S' } });

    await waitFor(() => {
      const filteredLocation = screen.getByText('Leeds');
      expect(filteredLocation).toBeInTheDocument();
    });
  });
});
