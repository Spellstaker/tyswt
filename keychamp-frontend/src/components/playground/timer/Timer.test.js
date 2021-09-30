import { render, screen } from '@testing-library/react';
import Timer from './Timer';

test('Timer renders valid time', () => {
    render(<Timer seconds={10} />)

    const time = screen.getByText("10.0");
    expect(time).toBeInTheDocument();
})