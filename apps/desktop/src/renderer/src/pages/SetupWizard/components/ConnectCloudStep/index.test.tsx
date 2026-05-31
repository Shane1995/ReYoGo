import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectCloudStep } from '.';

const baseProps = {
  tursoUrl: '',
  authToken: '',
  connecting: false,
  connectError: null,
  onTursoUrlChange: vi.fn(),
  onAuthTokenChange: vi.fn(),
  onConnect: vi.fn(),
};

describe('ConnectCloudStep', () => {
  it('renders URL and auth token inputs', () => {
    render(<ConnectCloudStep {...baseProps} />);
    expect(screen.getByPlaceholderText('libsql://your-db.turso.io')).toBeTruthy();
    expect(screen.getByPlaceholderText('eyJhbGci…')).toBeTruthy();
  });

  it('disables button when url does not start with libsql://', () => {
    render(<ConnectCloudStep {...baseProps} tursoUrl="https://wrong.url" authToken="tok" />);
    expect(screen.getByRole('button', { name: /connect/i })).toBeDisabled();
  });

  it('disables button when authToken is empty', () => {
    render(<ConnectCloudStep {...baseProps} tursoUrl="libsql://my-db.turso.io" authToken="" />);
    expect(screen.getByRole('button', { name: /connect/i })).toBeDisabled();
  });

  it('enables button when url and authToken are valid', () => {
    render(<ConnectCloudStep {...baseProps} tursoUrl="libsql://my-db.turso.io" authToken="tok" />);
    expect(screen.getByRole('button', { name: /connect/i })).not.toBeDisabled();
  });

  it('shows Connecting… and disables inputs when connecting is true', () => {
    render(
      <ConnectCloudStep
        {...baseProps}
        tursoUrl="libsql://my-db.turso.io"
        authToken="tok"
        connecting={true}
      />,
    );
    expect(screen.getByText('Connecting…')).toBeTruthy();
    expect(screen.getByPlaceholderText('libsql://your-db.turso.io')).toBeDisabled();
    expect(screen.getByPlaceholderText('eyJhbGci…')).toBeDisabled();
  });

  it('shows connectError when provided', () => {
    render(<ConnectCloudStep {...baseProps} connectError="Auth failed" />);
    expect(screen.getByText('Auth failed')).toBeTruthy();
  });

  it('calls onConnect when button is clicked with valid inputs', () => {
    const onConnect = vi.fn();
    render(
      <ConnectCloudStep
        {...baseProps}
        tursoUrl="libsql://my-db.turso.io"
        authToken="tok"
        onConnect={onConnect}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /connect/i }));
    expect(onConnect).toHaveBeenCalled();
  });

  it('calls onConnect when Enter is pressed on token input with valid inputs', () => {
    const onConnect = vi.fn();
    render(
      <ConnectCloudStep
        {...baseProps}
        tursoUrl="libsql://my-db.turso.io"
        authToken="tok"
        onConnect={onConnect}
      />,
    );
    fireEvent.keyDown(screen.getByPlaceholderText('eyJhbGci…'), { key: 'Enter' });
    expect(onConnect).toHaveBeenCalled();
  });

  it('does not call onConnect on Enter when url is invalid', () => {
    const onConnect = vi.fn();
    render(
      <ConnectCloudStep
        {...baseProps}
        tursoUrl="https://wrong"
        authToken="tok"
        onConnect={onConnect}
      />,
    );
    fireEvent.keyDown(screen.getByPlaceholderText('eyJhbGci…'), { key: 'Enter' });
    expect(onConnect).not.toHaveBeenCalled();
  });
});
