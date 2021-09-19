import { render, screen } from '@testing-library/react';
import TypeArea from './TypeArea'

test('TypeArea renders', () => {
  render(<TypeArea text="A random text!" />);
});

test('TypeArea renders undefined text', () => {
  render(<TypeArea />);
})