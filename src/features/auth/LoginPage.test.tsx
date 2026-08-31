import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { AuthProvider } from '../../app/AuthContext';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('validates email and offers a keyboard-accessible demo path', async () => {
    render(<AuthProvider><MemoryRouter><LoginPage /></MemoryRouter></AuthProvider>);
    await userEvent.click(screen.getByRole('button', { name: '寄送登入連結' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('請輸入有效的 Email');
    expect(screen.getByRole('button', { name: '使用 Google 繼續' })).toBeEnabled();
  });
  it('has no automated accessibility violations', async () => {
    const { container } = render(<AuthProvider><MemoryRouter><LoginPage /></MemoryRouter></AuthProvider>);
    const result = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toHaveLength(0);
  });
});
