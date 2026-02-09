import { AxiosError, AxiosHeaders } from 'axios';
import { getErrorMessage } from './error';

describe('getErrorMessage', () => {
  it('extracts string message from AxiosError response', () => {
    const error = new AxiosError('fail', '400', undefined, undefined, {
      data: { message: 'Email already exists' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    expect(getErrorMessage(error)).toBe('Email already exists');
  });

  it('extracts first element from array message', () => {
    const error = new AxiosError('fail', '400', undefined, undefined, {
      data: { message: ['name is required', 'email is required'] },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    expect(getErrorMessage(error)).toBe('name is required');
  });

  it('returns fallback when AxiosError has no response', () => {
    const error = new AxiosError('Network Error');
    expect(getErrorMessage(error)).toBe('Something went wrong');
  });

  it('returns fallback for non-Axios errors', () => {
    expect(getErrorMessage(new Error('generic'))).toBe('Something went wrong');
  });

  it('returns fallback for unknown types', () => {
    expect(getErrorMessage('string error')).toBe('Something went wrong');
    expect(getErrorMessage(null)).toBe('Something went wrong');
    expect(getErrorMessage(undefined)).toBe('Something went wrong');
  });
});
