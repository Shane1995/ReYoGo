import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AppConfigProvider, useAppConfig } from '.';
import { appConfig } from '@/config/app.config';

describe('useAppConfig', () => {
  it('throws when used outside AppConfigProvider', () => {
    expect(() => renderHook(() => useAppConfig())).toThrow(
      'useAppConfig must be used within AppConfigProvider',
    );
  });

  it('returns the static appConfig by default', () => {
    const { result } = renderHook(() => useAppConfig(), {
      wrapper: AppConfigProvider,
    });
    expect(result.current.config).toBe(appConfig);
  });

  it('config has all four nav sections', () => {
    const { result } = renderHook(() => useAppConfig(), {
      wrapper: AppConfigProvider,
    });
    const { nav } = result.current.config;
    expect(nav).toHaveProperty('primary');
    expect(nav).toHaveProperty('stock');
    expect(nav).toHaveProperty('invoices');
    expect(nav).toHaveProperty('costing');
  });

  it('config has dashboard stat cards', () => {
    const { result } = renderHook(() => useAppConfig(), {
      wrapper: AppConfigProvider,
    });
    expect(result.current.config.dashboard.statCards.length).toBeGreaterThan(0);
  });
});
