import { validate } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto', () => {
  let dto: UpdateProfileDto;

  beforeEach(() => {
    dto = new UpdateProfileDto();
  });

  it('모든 필드가 선택사항이어야 함', async () => {
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('유효한 프로필 업데이트 데이터로 검증을 통과해야 함', async () => {
    dto.name = '홍길동';
    dto.bio = '안녕하세요. 개발자입니다.';
    dto.techStack = ['JavaScript', 'TypeScript'];
    dto.profileImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('자기소개가 500자를 초과하면 검증에 실패해야 함', async () => {
    dto.bio = 'a'.repeat(501);

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('bio');
  });

  it('이름이 문자열이 아니면 검증에 실패해야 함', async () => {
    dto.name = 123 as any;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
  });

  it('기술 스택이 문자열 배열이 아니면 검증에 실패해야 함', async () => {
    dto.techStack = ['JavaScript', 123] as any;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('techStack');
  });

  it('프로필 이미지가 문자열이 아니면 검증에 실패해야 함', async () => {
    dto.profileImage = 123 as any;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('profileImage');
  });
});