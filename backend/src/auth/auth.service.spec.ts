import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
      role: UserRole.MENTEE,
      bio: '안녕하세요',
    };

    it('멘티 회원가입이 성공해야 함', async () => {
      const mockUser = {
        id: '123',
        email: signupDto.email,
        name: signupDto.name,
        role: signupDto.role,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('멘토 회원가입 시 기술 스택이 필수여야 함', async () => {
      const mentorDto: SignupDto = {
        ...signupDto,
        role: UserRole.MENTOR,
        techStack: ['JavaScript', 'React'],
      };

      const mockMentor = {
        id: '456',
        email: mentorDto.email,
        name: mentorDto.name,
        role: mentorDto.role,
        techStack: mentorDto.techStack,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockMentor);
      mockUserRepository.save.mockResolvedValue(mockMentor);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.signup(mentorDto);

      expect(result.user.role).toBe(UserRole.MENTOR);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          techStack: mentorDto.techStack,
        }),
      );
    });

    it('멘토 회원가입 시 기술 스택이 없으면 에러가 발생해야 함', async () => {
      const mentorDto: SignupDto = {
        ...signupDto,
        role: UserRole.MENTOR,
        techStack: [],
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.signup(mentorDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('이미 존재하는 이메일로 회원가입 시 에러가 발생해야 함', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: '123' });

      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('유효한 자격증명으로 로그인이 성공해야 함', async () => {
      const mockUser = {
        id: '123',
        email: loginDto.email,
        password: 'hashed-password',
        name: '홍길동',
        role: UserRole.MENTEE,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('존재하지 않는 이메일로 로그인 시 에러가 발생해야 함', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('잘못된 비밀번호로 로그인 시 에러가 발생해야 함', async () => {
      const mockUser = {
        id: '123',
        email: loginDto.email,
        password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('JWT 토큰 생성', () => {
    it('올바른 클레임을 포함한 JWT 토큰을 생성해야 함', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: '홍길동',
        role: UserRole.MENTEE,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await service.signup({
        email: mockUser.email,
        password: 'password123',
        name: mockUser.name,
        role: mockUser.role,
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          iss: 'mentor-mentee-app',
          aud: 'mentor-mentee-app-users',
        }),
      );
    });
  });
});