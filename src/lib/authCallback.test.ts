import { describe, expect, it } from 'vitest';
import { authCallbackUrl } from './authCallback';

describe('authCallbackUrl', () => {
  it('keeps root deployments at /trips', () => {
    expect(authCallbackUrl('https://travel.example', '/')).toBe('https://travel.example/trips');
  });

  it('keeps GitHub Pages deployments inside their repository base', () => {
    expect(authCallbackUrl('https://owner.github.io', '/travel/')).toBe('https://owner.github.io/travel/trips');
  });
});
