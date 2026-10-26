import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { WeatherForm } from '../../src/components/WeatherForm';

describe('WeatherForm', () => {
  it('renders a textbox with an accessible label matching /ciudad/i', () => {
    render(<WeatherForm onSubmit={vi.fn()} isLoading={false} defaultValue="" />);
    expect(screen.getByRole('textbox', { name: /ciudad/i })).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    render(<WeatherForm onSubmit={vi.fn()} isLoading={false} defaultValue="" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onSubmit with the current input value when the form is submitted', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<WeatherForm onSubmit={handleSubmit} isLoading={false} defaultValue="" />);

    const input = screen.getByRole('textbox', { name: /ciudad/i });
    await user.type(input, 'Madrid');
    await user.click(screen.getByRole('button'));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('Madrid');
  });

  it('disables the submit button when isLoading is true', () => {
    render(<WeatherForm onSubmit={vi.fn()} isLoading={true} defaultValue="" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables the submit button when isLoading is false', () => {
    render(<WeatherForm onSubmit={vi.fn()} isLoading={false} defaultValue="" />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});
