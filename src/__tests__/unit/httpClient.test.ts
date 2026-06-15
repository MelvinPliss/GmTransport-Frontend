import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { parseApiError } from '../../services/httpClient';

function makeAxiosError(overrides: Partial<{ code: string; message: string; response: unknown }>) {
  const err = new Error('axios error') as Error & {
    isAxiosError: boolean;
    code?: string;
    response?: unknown;
  };
  err.isAxiosError = true;
  Object.assign(err, overrides);
  // Make axios.isAxiosError return true
  vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
  return err;
}

describe('parseApiError', () => {
  it('returns timeout error for ECONNABORTED code', () => {
    const err = makeAxiosError({ code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' });
    const result = parseApiError(err);
    expect(result.kind).toBe('timeout');
  });

  it('returns timeout error for timeout in message', () => {
    const err = makeAxiosError({ message: 'timeout' });
    const result = parseApiError(err);
    expect(result.kind).toBe('timeout');
  });

  it('returns network error when no response', () => {
    const err = makeAxiosError({ message: 'Network Error' });
    (err as unknown as Record<string, unknown>).response = undefined;
    const result = parseApiError(err);
    expect(result.kind).toBe('network');
  });

  it('returns validation error for 422 with errors field', () => {
    const err = makeAxiosError({});
    (err as unknown as Record<string, unknown>).response = {
      status: 422,
      data: { errors: { email: 'Invalid email' } },
    };
    const result = parseApiError(err);
    expect(result.kind).toBe('validation');
    if (result.kind === 'validation') {
      expect(result.errors.email).toBe('Invalid email');
    }
  });

  it('returns server error for 500', () => {
    const err = makeAxiosError({});
    (err as unknown as Record<string, unknown>).response = {
      status: 500,
      data: { message: 'Internal Server Error' },
    };
    const result = parseApiError(err);
    expect(result.kind).toBe('server');
    if (result.kind === 'server') {
      expect(result.status).toBe(500);
    }
  });

  it('returns server error for 400', () => {
    const err = makeAxiosError({});
    (err as unknown as Record<string, unknown>).response = {
      status: 400,
      data: { message: 'Bad Request' },
    };
    const result = parseApiError(err);
    expect(result.kind).toBe('server');
    if (result.kind === 'server') {
      expect(result.message).toBe('Bad Request');
    }
  });

  it('returns unknown error for non-axios errors', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(false);
    const result = parseApiError(new Error('something random'));
    expect(result.kind).toBe('unknown');
  });
});
