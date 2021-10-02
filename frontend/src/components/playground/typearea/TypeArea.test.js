import { render } from '@testing-library/react';
import TypeArea from './TypeArea'

test('TypeArea renders', () => {
  render(<TypeArea>A random text!</TypeArea>);
});

test('TypeArea renders undefined text', () => {
  render(<TypeArea />);
})
