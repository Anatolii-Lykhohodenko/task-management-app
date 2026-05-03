import '@testing-library/jest-dom/vitest';

vi.mock('server-only', () => ({}));

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn(),
}));