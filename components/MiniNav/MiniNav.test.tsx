import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { MiniNav } from './MiniNav';

describe('MiniNav', () => {
  it('renders the Change Location button', () => {
    render(<MiniNav />);
    const buttonElement = screen.getByText(/Change Location/i);
    expect(buttonElement).toBeInTheDocument();
  });
});
