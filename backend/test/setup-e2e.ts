// E2E 테스트를 위한 환경 설정
process.env.NODE_ENV = 'test';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_USERNAME = 'postgres';
process.env.DATABASE_PASSWORD = 'password';
process.env.DATABASE_NAME = 'test_db';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

// 테스트 타임아웃 설정
jest.setTimeout(30000);