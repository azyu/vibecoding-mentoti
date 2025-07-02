import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { MatchRequestsService } from './match-requests.service';
import { User, UserRole } from '../entities/user.entity';
import { MatchRequest, MatchRequestStatus } from '../entities/match-request.entity';
import { CreateMatchRequestDto } from './dto/create-match-request.dto';

describe('MatchRequestsService', () => {
  let service: MatchRequestsService;
  let matchRequestRepository: Repository<MatchRequest>;
  let userRepository: Repository<User>;

  const mockMatchRequestRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchRequestsService,
        {
          provide: getRepositoryToken(MatchRequest),
          useValue: mockMatchRequestRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<MatchRequestsService>(MatchRequestsService);
    matchRequestRepository = module.get<Repository<MatchRequest>>(
      getRepositoryToken(MatchRequest),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMatchRequest', () => {
    const menteeId = 'mentee-123';
    const mentorId = 'mentor-456';
    const createDto: CreateMatchRequestDto = {
      mentorId,
      message: '멘토링 받고 싶습니다.',
    };

    const mockMentee = {
      id: menteeId,
      name: '이멘티',
      role: UserRole.MENTEE,
    };

    const mockMentor = {
      id: mentorId,
      name: '김멘토',
      role: UserRole.MENTOR,
    };

    it('매칭 요청을 정상적으로 생성해야 함', async () => {
      const mockRequest = {
        id: 'request-1',
        mentorId,
        menteeId,
        message: createDto.message,
        status: MatchRequestStatus.PENDING,
        createdAt: new Date(),
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockMentee)
        .mockResolvedValueOnce(mockMentor);
      mockMatchRequestRepository.findOne.mockResolvedValue(null);
      mockMatchRequestRepository.count.mockResolvedValue(0);
      mockMatchRequestRepository.create.mockReturnValue(mockRequest);
      mockMatchRequestRepository.save.mockResolvedValue(mockRequest);

      const result = await service.createMatchRequest(menteeId, createDto);

      expect(result).toEqual(expect.objectContaining({
        id: mockRequest.id,
        mentorId,
        menteeId,
        status: MatchRequestStatus.PENDING,
      }));
    });

    it('멘토가 요청을 보내려고 하면 에러가 발생해야 함', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: menteeId,
        role: UserRole.MENTOR,
      });

      await expect(
        service.createMatchRequest(menteeId, createDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('이미 해당 멘토에게 요청을 보낸 경우 에러가 발생해야 함', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockMentee)
        .mockResolvedValueOnce(mockMentor);
      mockMatchRequestRepository.findOne.mockResolvedValue({
        id: 'existing-request',
      });

      await expect(
        service.createMatchRequest(menteeId, createDto),
      ).rejects.toThrow(ConflictException);
    });

    it('이미 대기 중인 요청이 있는 경우 에러가 발생해야 함', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockMentee)
        .mockResolvedValueOnce(mockMentor);
      mockMatchRequestRepository.findOne.mockResolvedValue(null);
      mockMatchRequestRepository.count.mockResolvedValue(1);

      await expect(
        service.createMatchRequest(menteeId, createDto),
      ).rejects.toThrow(ConflictException);
    });

    it('멘토가 이미 다른 멘티와 매칭된 경우 에러가 발생해야 함', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockMentee)
        .mockResolvedValueOnce(mockMentor);
      mockMatchRequestRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'accepted-request' });
      mockMatchRequestRepository.count.mockResolvedValue(0);

      await expect(
        service.createMatchRequest(menteeId, createDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('acceptRequest', () => {
    const mentorId = 'mentor-123';
    const requestId = 'request-1';

    it('요청을 정상적으로 수락해야 함', async () => {
      const mockRequest = {
        id: requestId,
        mentorId,
        menteeId: 'mentee-456',
        status: MatchRequestStatus.PENDING,
        mentor: { id: mentorId, name: '김멘토' },
        mentee: { id: 'mentee-456', name: '이멘티' },
      };

      mockMatchRequestRepository.findOne
        .mockResolvedValueOnce(mockRequest)
        .mockResolvedValueOnce(null);
      mockMatchRequestRepository.save.mockResolvedValue({
        ...mockRequest,
        status: MatchRequestStatus.ACCEPTED,
      });

      const result = await service.acceptRequest(mentorId, requestId);

      expect(result.status).toBe(MatchRequestStatus.ACCEPTED);
      expect(mockMatchRequestRepository.save).toHaveBeenCalled();
    });

    it('존재하지 않는 요청 수락 시 에러가 발생해야 함', async () => {
      mockMatchRequestRepository.findOne.mockResolvedValue(null);

      await expect(
        service.acceptRequest(mentorId, requestId),
      ).rejects.toThrow(NotFoundException);
    });

    it('대기 중이 아닌 요청 수락 시 에러가 발생해야 함', async () => {
      mockMatchRequestRepository.findOne.mockResolvedValue({
        id: requestId,
        mentorId,
        status: MatchRequestStatus.ACCEPTED,
      });

      await expect(
        service.acceptRequest(mentorId, requestId),
      ).rejects.toThrow(BadRequestException);
    });

    it('이미 다른 멘티와 매칭된 경우 에러가 발생해야 함', async () => {
      const mockRequest = {
        id: requestId,
        mentorId,
        status: MatchRequestStatus.PENDING,
        mentor: { id: mentorId },
        mentee: { id: 'mentee-456' },
      };

      mockMatchRequestRepository.findOne
        .mockResolvedValueOnce(mockRequest)
        .mockResolvedValueOnce({ id: 'other-accepted-request' });

      await expect(
        service.acceptRequest(mentorId, requestId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('rejectRequest', () => {
    const mentorId = 'mentor-123';
    const requestId = 'request-1';

    it('요청을 정상적으로 거절해야 함', async () => {
      const mockRequest = {
        id: requestId,
        mentorId,
        status: MatchRequestStatus.PENDING,
        mentor: { id: mentorId, name: '김멘토' },
        mentee: { id: 'mentee-456', name: '이멘티' },
      };

      mockMatchRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockMatchRequestRepository.save.mockResolvedValue({
        ...mockRequest,
        status: MatchRequestStatus.REJECTED,
      });

      const result = await service.rejectRequest(mentorId, requestId);

      expect(result.status).toBe(MatchRequestStatus.REJECTED);
    });
  });

  describe('cancelRequest', () => {
    const menteeId = 'mentee-123';
    const requestId = 'request-1';

    it('요청을 정상적으로 취소해야 함', async () => {
      const mockRequest = {
        id: requestId,
        menteeId,
        status: MatchRequestStatus.PENDING,
      };

      mockMatchRequestRepository.findOne.mockResolvedValue(mockRequest);

      await service.cancelRequest(menteeId, requestId);

      expect(mockMatchRequestRepository.remove).toHaveBeenCalledWith(
        mockRequest,
      );
    });

    it('대기 중이 아닌 요청 취소 시 에러가 발생해야 함', async () => {
      mockMatchRequestRepository.findOne.mockResolvedValue({
        id: requestId,
        menteeId,
        status: MatchRequestStatus.ACCEPTED,
      });

      await expect(
        service.cancelRequest(menteeId, requestId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getIncomingRequests', () => {
    it('받은 요청 목록을 조회해야 함', async () => {
      const mentorId = 'mentor-123';
      const mockRequests = [
        {
          id: '1',
          mentorId,
          menteeId: 'mentee-1',
          status: MatchRequestStatus.PENDING,
          mentee: { id: 'mentee-1', name: '멘티1' },
          createdAt: new Date(),
        },
        {
          id: '2',
          mentorId,
          menteeId: 'mentee-2',
          status: MatchRequestStatus.ACCEPTED,
          mentee: { id: 'mentee-2', name: '멘티2' },
          createdAt: new Date(),
        },
      ];

      const mockMentor = { id: mentorId, name: '김멘토' };

      mockMatchRequestRepository.find.mockResolvedValue(mockRequests);
      mockUserRepository.findOne.mockResolvedValue(mockMentor);

      const result = await service.getIncomingRequests(mentorId);

      expect(result).toHaveLength(2);
      expect(result[0].mentorName).toBe(mockMentor.name);
    });
  });

  describe('getOutgoingRequests', () => {
    it('보낸 요청 목록을 조회해야 함', async () => {
      const menteeId = 'mentee-123';
      const mockRequests = [
        {
          id: '1',
          menteeId,
          mentorId: 'mentor-1',
          status: MatchRequestStatus.PENDING,
          mentor: { id: 'mentor-1', name: '멘토1' },
          createdAt: new Date(),
        },
      ];

      const mockMentee = { id: menteeId, name: '이멘티' };

      mockMatchRequestRepository.find.mockResolvedValue(mockRequests);
      mockUserRepository.findOne.mockResolvedValue(mockMentee);

      const result = await service.getOutgoingRequests(menteeId);

      expect(result).toHaveLength(1);
      expect(result[0].menteeName).toBe(mockMentee.name);
    });
  });
});