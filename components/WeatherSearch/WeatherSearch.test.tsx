import { WeatherLocation } from '@/components/weather.server';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import WeatherSearch from './WeatherSearch';
import { mockSearchData } from './mockData';

beforeEach(() => {
  fetchMock.mockResponseOnce(JSON.stringify(mockSearchData as WeatherLocation[]));
});

afterEach(() => {
  fetchMock.resetMocks();
  cleanup();
});

describe('WeatherSearch', () => {
  it('renders without crashing', () => {
    render(<WeatherSearch />);
    const inputElement = screen.getByPlaceholderText('Search locations...');
    expect(inputElement).toBeInTheDocument();
  });

  it('filters locations based on search input', async () => {
    render(<WeatherSearch />);
    const inputElement = screen.getByTestId('search-input');

    // Simulate user typing 'Location 1' into the search input
    fireEvent.change(inputElement, { target: { value: 'Scatsta' } });

    fireEvent.focus(inputElement); // Simulate user focusing on the search input

    // Wait for the useEffect hook to run and update the state
    await waitFor(
      () => {
        const scrollAreaElement = screen.getByTestId('scroll-area');

        //console.log(scrollAreaElement.innerHTML);

        expect(scrollAreaElement).toBeInTheDocument();

        const filteredLocation = screen.getByText(/Scatsta/i);
        expect(filteredLocation).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('counts the number of items returned', async () => {
    render(<WeatherSearch />);
    const inputElement = screen.getByTestId('search-input');

    // Simulate user typing 'Location 1' into the search input
    fireEvent.change(inputElement, { target: { value: 'Sca' } });

    fireEvent.focus(inputElement); // Simulate user focusing on the search input

    // Wait for the useEffect hook to run and update the state
    await waitFor(
      () => {
        const scrollAreaElement = screen.getByTestId('scroll-area');

        //console.log(scrollAreaElement.innerHTML);

        expect(scrollAreaElement).toBeInTheDocument();

        // count the number of items returned
        const items = scrollAreaElement.querySelectorAll('li');

        expect(items.length).toEqual(22);
      },
      { timeout: 5000 },
    );
  });

  it('does not display locations when search input is less than 3 characters', async () => {
    render(<WeatherSearch />);
    const inputElement = screen.getByPlaceholderText('Search locations...');

    // Simulate user typing 'Sc' into the search input
    fireEvent.change(inputElement, { target: { value: 'Sc' } });

    // Wait for the useEffect hook to run and update the state
    await waitFor(() => {
      const filteredLocation = screen.queryByText('Scatsta');
      expect(filteredLocation).not.toBeInTheDocument();
    });
  });
});
