import { UserRole } from '../../src/entities/user.entity';
import { SignupData } from '../../src/types';

export const mentorFixture: SignupData = {
  email: 'mentor@example.com',
  password: 'password123',
  name: '김멘토',
  role: UserRole.MENTOR,
  bio: '경험이 풍부한 풀스택 개발자입니다.',
  techStack: ['JavaScript', 'React', 'Node.js'],
};

export const menteeFixture: SignupData = {
  email: 'mentee@example.com',
  password: 'password123',
  name: '이멘티',
  role: UserRole.MENTEE,
  bio: '열정적인 프로그래밍 입문자입니다.',
};