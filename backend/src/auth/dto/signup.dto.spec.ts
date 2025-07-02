import { validate } from 'class-validator';
import { SignupDto } from './signup.dto';
import { UserRole } from '../../entities/user.entity';

describe('SignupDto', () => {
  let dto: SignupDto;

  beforeEach(() => {
    dto = new SignupDto();
  });

  it('유효한 데이터로 검증을 통과해야 함', async () => {
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.name = '홍길동';
    dto.role = UserRole.MENTEE;
    dto.bio = '안녕하세요';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('잘못된 이메일 형식은 검증에 실패해야 함', async () => {
    dto.email = 'invalid-email';
    dto.password = 'password123';
    dto.name = '홍길동';
    dto.role = UserRole.MENTEE;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
  });

  it('비밀번호가 8자 미만이면 검증에 실패해야 함', async () => {
    dto.email = 'test@example.com';
    dto.password = 'pass123';
    dto.name = '홍길동';
    dto.role = UserRole.MENTEE;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
  });

  it('이름이 없으면 검증에 실패해야 함', async () => {
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.role = UserRole.MENTEE;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
  });

  it('잘못된 역할은 검증에 실패해야 함', async () => {
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.name = '홍길동';
    dto.role = 'invalid-role' as UserRole;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('role');
  });

  it('멘토의 경우 기술 스택은 선택사항이어야 함', async () => {
    dto.email = 'mentor@example.com';
    dto.password = 'password123';
    dto.name = '김멘토';
    dto.role = UserRole.MENTOR;
    dto.techStack = ['JavaScript', 'React'];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('기술 스택이 문자열 배열이 아니면 검증에 실패해야 함', async () => {
    dto.email = 'mentor@example.com';
    dto.password = 'password123';
    dto.name = '김멘토';
    dto.role = UserRole.MENTOR;
    dto.techStack = [123, 456] as any;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('techStack');
  });
});