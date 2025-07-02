import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from '../entities/user.entity';
import { MatchRequest, MatchRequestStatus } from '../entities/match-request.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MentorListQueryDto } from './dto/mentor-list.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let matchRequestRepository: Repository<MatchRequest>;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMatchRequestRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(MatchRequest),
          useValue: mockMatchRequestRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    matchRequestRepository = module.get<Repository<MatchRequest>>(
      getRepositoryToken(MatchRequest),
    );

    mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockMatchRequestRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('사용자 프로필을 정상적으로 조회해야 함', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: '홍길동',
        role: UserRole.MENTEE,
        bio: '안녕하세요',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('123');

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      }));
    });

    it('존재하지 않는 사용자 조회 시 에러가 발생해야 함', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: '홍길동',
      role: UserRole.MENTEE,
      save: jest.fn(),
    };

    it('프로필을 정상적으로 수정해야 함', async () => {
      const updateDto: UpdateProfileDto = {
        name: '홍길동2',
        bio: '수정된 자기소개',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.updateProfile('123', updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.bio).toBe(updateDto.bio);
    });

    it('멘티가 기술 스택을 설정하려고 하면 에러가 발생해야 함', async () => {
      const updateDto: UpdateProfileDto = {
        techStack: ['JavaScript'],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.updateProfile('123', updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('프로필 이미지가 5MB를 초과하면 에러가 발생해야 함', async () => {
      const largeBase64 = 'data:image/png;base64,' + 'A'.repeat(7 * 1024 * 1024);
      const updateDto: UpdateProfileDto = {
        profileImage: largeBase64,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.updateProfile('123', updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMentorList', () => {
    it('멘토 목록을 정상적으로 조회해야 함', async () => {
      const mockMentors = [
        {
          id: '1',
          name: '김멘토',
          role: UserRole.MENTOR,
          techStack: ['JavaScript', 'React'],
          bio: '멘토입니다',
        },
        {
          id: '2',
          name: '이멘토',
          role: UserRole.MENTOR,
          techStack: ['Python', 'Django'],
          bio: '멘토입니다',
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockMentors, 2]);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const query: MentorListQueryDto = {
        page: 1,
        limit: 10,
      };

      const result = await service.getMentorList('mentee-id', query);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('이름으로 멘토를 필터링해야 함', async () => {
      const query: MentorListQueryDto = {
        name: '김',
        page: 1,
        limit: 10,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getMentorList('mentee-id', query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.name LIKE :name',
        { name: '%김%' },
      );
    });

    it('기술 스택으로 멘토를 필터링해야 함', async () => {
      const query: MentorListQueryDto = {
        techStack: ['JavaScript', 'React'],
        page: 1,
        limit: 10,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getMentorList('mentee-id', query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'EXISTS (SELECT 1 FROM unnest(user.techStack) as tech WHERE tech = ANY(:techStack))',
        { techStack: query.techStack },
      );
    });

    it('매칭된 멘토를 표시해야 함', async () => {
      const mockMentors = [
        {
          id: '1',
          name: '김멘토',
          role: UserRole.MENTOR,
          techStack: ['JavaScript'],
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockMentors, 1]);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { match_mentorId: '1' },
      ]);

      const result = await service.getMentorList('mentee-id', {
        page: 1,
        limit: 10,
      });

      expect(result.data[0].isMatched).toBe(true);
    });
  });
});