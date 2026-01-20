import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticationMiddleware } from '../../../middleware/auth';

vi.mock('../../../config/database', () => ({
  dbManager: {
    query: vi.fn().mockImplementation((sql: string, params: any[]) => {
      console.log('Database query called:', sql, params);
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      if (normalizedSql.includes('SELECT id, email, role, status FROM users')) {
        return Promise.resolve({
          rows: [{
            id: params[0],
            email: 'test@example.com',
            role: 'user',
            status: 'active'
          }]
        });
      }
      return Promise.resolve({ rows: [] });
    })
  }
}));

describe('AuthenticationMiddleware Debug', () => {
  let auth: AuthenticationMiddleware;

  beforeEach(() => {
    vi.clearAllMocks();
    auth = new AuthenticationMiddleware();
  });

  it('调试：生成和验证令牌', async () => {
    const payload = {
      userId: 'user123',
      email: 'test@example.com',
      role: 'user'
    };

    const token = auth.generateToken(payload);
    console.log('Generated token:', token);
    console.log('Token parts:', token.split('.'));

    const result = await auth.verifyToken(token);
    console.log('Verification result:', JSON.stringify(result, null, 2));
    console.log('Result success:', result.success);
    console.log('Result user:', result.user);
    console.log('Result error:', result.error);
    console.log('Result code:', result.code);

    expect(result.success).toBe(true);
  });
});
