import { render, screen } from '@testing-library/react';
import App from './App';

test('renders cringe', () => {
  render(<App />);
  const cringeElement = screen.getByText("You're my little keychamp!");
  expect(cringeElement).toBeInTheDocument();
});
