import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import WeatherSearch from './WeatherSearch';

describe('WeatherSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<WeatherSearch setLocation={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search locations...')).toBeInTheDocument();
  });

  it('shows matched locations for query', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        locations: [
          { adminArea: 'England', country: 'United Kingdom', isRegion: false, lat: 53.8, lon: -1.5, name: 'Leeds' },
        ],
      }),
      ok: true,
    });

    render(<WeatherSearch setLocation={jest.fn()} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Lee' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Leeds')).toBeInTheDocument();
    });
  });

  it('shows unknown location when no match exists', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ locations: [] }),
      ok: true,
    });

    render(<WeatherSearch setLocation={jest.fn()} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'zzzzzz' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Unknown location')).toBeInTheDocument();
    });
  });

  it('does not query for short input', () => {
    render(<WeatherSearch setLocation={jest.fn()} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'S' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByTestId('scroll-area')).not.toBeInTheDocument();
  });
});
