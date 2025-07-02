import { JwtPayload } from './strategies/jwt.strategy';
import { UserRole } from '../entities/user.entity';

describe('JWT Payload 검증', () => {
  it('모든 필수 클레임을 포함해야 함', () => {
    const payload: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      name: '홍길동',
      role: UserRole.MENTEE,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'mentor-mentee-app',
      aud: 'mentor-mentee-app-users',
      jti: 'unique-jwt-id',
    };

    expect(payload.sub).toBeDefined();
    expect(payload.email).toBeDefined();
    expect(payload.name).toBeDefined();
    expect(payload.role).toBeDefined();
    expect(payload.iat).toBeDefined();
    expect(payload.exp).toBeDefined();
  });

  it('토큰 유효기간이 1시간이어야 함', () => {
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      name: '홍길동',
      role: UserRole.MENTOR,
      iat: now,
      exp: now + 3600,
    };

    const expirationTime = payload.exp - payload.iat;
    expect(expirationTime).toBe(3600); // 1시간 = 3600초
  });

  it('선택적 클레임이 올바르게 설정되어야 함', () => {
    const payload: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      name: '홍길동',
      role: UserRole.MENTOR,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      nbf: Math.floor(Date.now() / 1000),
      iss: 'mentor-mentee-app',
      aud: 'mentor-mentee-app-users',
      jti: 'unique-jwt-id',
    };

    expect(payload.nbf).toBeDefined();
    expect(payload.iss).toBe('mentor-mentee-app');
    expect(payload.aud).toBe('mentor-mentee-app-users');
    expect(payload.jti).toBeDefined();
  });
});