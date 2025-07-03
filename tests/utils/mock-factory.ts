import { vi } from 'vitest';

export const createMockDb = () => {
  const mockDbLimit = vi.fn();
  const mockDbReturning = vi.fn();
  const mockDbFrom = vi.fn();
  
  return {
    mocks: {
      mockDbLimit,
      mockDbReturning,
      mockDbFrom,
    },
    db: {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: mockDbLimit,
          }),
        }),
      }),
      insert: () => ({
        values: () => ({
          returning: mockDbReturning,
        }),
      }),
    },
    users: {},
  };
};

export const createMockJwt = () => {
  const mockSign = vi.fn();
  const mockVerify = vi.fn();
  
  return {
    mocks: {
      mockSign,
      mockVerify,
    },
    jwt: {
      sign: mockSign,
      verify: mockVerify,
    },
  };
};
