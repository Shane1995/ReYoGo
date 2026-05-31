import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChoosePathStep } from '.';
import { SetupPath } from '../..';

describe('ChoosePathStep', () => {
  it('renders both path options', () => {
    render(<ChoosePathStep onChoose={vi.fn()} />);
    expect(screen.getByText('Connect to existing database')).toBeTruthy();
    expect(screen.getByText('Set up locally')).toBeTruthy();
  });

  it('calls onChoose with Cloud when cloud card is clicked', () => {
    const onChoose = vi.fn();
    render(<ChoosePathStep onChoose={onChoose} />);
    fireEvent.click(screen.getByText('Connect to existing database').closest('button')!);
    expect(onChoose).toHaveBeenCalledWith(SetupPath.Cloud);
  });

  it('calls onChoose with Local when local card is clicked', () => {
    const onChoose = vi.fn();
    render(<ChoosePathStep onChoose={onChoose} />);
    fireEvent.click(screen.getByText('Set up locally').closest('button')!);
    expect(onChoose).toHaveBeenCalledWith(SetupPath.Local);
  });
});
