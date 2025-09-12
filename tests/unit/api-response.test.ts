import { describe, it, expect } from 'vitest';
import { createSuccess, createError, isSuccess, type ApiResponse } from '@/types/api';

interface SampleData { value: number; label: string }

describe('API Response Helpers', () => {
  it('createSuccess builds proper envelope', () => {
    const payload: SampleData = { value: 42, label: 'answer' };
    const res = createSuccess('OK', payload);
    expect(res).toEqual({ success: true, message: 'OK', data: payload });
    expect(isSuccess(res)).toBe(true);
  });

  it('createError builds proper envelope without optional fields', () => {
    const err = createError('validation_error');
    expect(err.success).toBe(false);
    expect(err.error).toBe('validation_error');
    expect('message' in err).toBe(false);
  });

  it('createError includes optional message and details', () => {
    const details = { fieldErrors: { name: ['Required'] } };
    const err = createError('validation_error', 'Invalid input', details);
    expect(err).toMatchObject({ success: false, error: 'validation_error', message: 'Invalid input', details });
  });

  it('type guard distinguishes success vs error', () => {
    const successResp = createSuccess('Done', { ok: true });
    const errorResp = createError('internal_error', 'Boom');
    const arr: ApiResponse<unknown>[] = [successResp, errorResp];
    const flags = arr.map(r => isSuccess(r));
    expect(flags).toEqual([true, false]);
  });
});
