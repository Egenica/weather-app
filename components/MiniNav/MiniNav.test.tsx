import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import { mockLocationData } from '../../mocks/mockLocationData';
import { MiniNav } from './MiniNav';

afterEach(() => {
  cleanup();
});

describe('MiniNav', () => {
  it('renders the Change Location button', () => {
    render(<MiniNav location={mockLocationData} setLocation={jest.fn()} />);
    const buttonElement = screen.getByText(/Change Location/i);
    expect(buttonElement).toBeInTheDocument();
  });
  it('renders the selected location name when location is provided', () => {
    render(<MiniNav location={mockLocationData} setLocation={jest.fn()} />);
    const locationNameElement = screen.getByText(mockLocationData.name);
    expect(locationNameElement).toBeInTheDocument();
  });

  it('does not render the selected location name when location is null', () => {
    render(<MiniNav location={null} setLocation={jest.fn()} />);
    const locationNameElement = screen.queryByText(mockLocationData.name);
    expect(locationNameElement).not.toBeInTheDocument();
  });
});
