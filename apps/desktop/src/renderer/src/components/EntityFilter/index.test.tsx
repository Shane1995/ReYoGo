import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { IEntity } from '@reyogo/types';
import { EntityFilter } from '.';

const entities: IEntity[] = [
  {
    id: 'e1',
    groupId: 'g1',
    name: 'Pub',
    defaultVatRate: 15,
    defaultVatMode: 'exclusive',
    archivedAt: null,
  },
  {
    id: 'e2',
    groupId: 'g1',
    name: 'Bar',
    defaultVatRate: 15,
    defaultVatMode: 'exclusive',
    archivedAt: null,
  },
];

describe('EntityFilter', () => {
  it('renders All + one pill per entity', () => {
    render(<EntityFilter entities={entities} selected={null} onChange={vi.fn()} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Pub')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
  });

  it('calls onChange with entity id when pill clicked', () => {
    const onChange = vi.fn();
    render(<EntityFilter entities={entities} selected={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('Pub'));
    expect(onChange).toHaveBeenCalledWith('e1');
  });

  it('calls onChange with null when All clicked', () => {
    const onChange = vi.fn();
    render(<EntityFilter entities={entities} selected="e1" onChange={onChange} />);
    fireEvent.click(screen.getByText('All'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('returns null when only one entity', () => {
    const { container } = render(
      <EntityFilter entities={[entities[0]!]} selected={null} onChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
