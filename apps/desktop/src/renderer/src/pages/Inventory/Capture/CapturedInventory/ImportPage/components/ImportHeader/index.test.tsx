import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImportHeader } from '.';

describe('ImportHeader', () => {
  it('shows the upload prompt and hides "Different file" outside review', () => {
    render(
      <ImportHeader
        phase="idle"
        entityName="Acme Cafe"
        onDownloadTemplate={vi.fn()}
        onChooseDifferentFile={vi.fn()}
      />,
    );
    expect(screen.getByText(/Upload an Excel or CSV file/)).toBeInTheDocument();
    expect(screen.getByText(/for Acme Cafe/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Different file' })).not.toBeInTheDocument();
  });

  it('falls back to a generic prompt when no entity is selected', () => {
    render(
      <ImportHeader phase="idle" onDownloadTemplate={vi.fn()} onChooseDifferentFile={vi.fn()} />,
    );
    expect(
      screen.getByText(/Upload an Excel or CSV file to bulk-add units, categories and items\./),
    ).toBeInTheDocument();
  });

  it('shows the review prompt and "Different file" button during review', () => {
    render(
      <ImportHeader
        phase="review"
        entityName="Acme Cafe"
        onDownloadTemplate={vi.fn()}
        onChooseDifferentFile={vi.fn()}
      />,
    );
    expect(screen.getByText(/Review what will be added to Acme Cafe/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Different file' })).toBeInTheDocument();
  });

  it('calls onDownloadTemplate when the template button is clicked', () => {
    const onDownloadTemplate = vi.fn();
    render(
      <ImportHeader
        phase="idle"
        onDownloadTemplate={onDownloadTemplate}
        onChooseDifferentFile={vi.fn()}
      />,
    );
    screen.getByRole('button', { name: /Template/ }).click();
    expect(onDownloadTemplate).toHaveBeenCalled();
  });
});
