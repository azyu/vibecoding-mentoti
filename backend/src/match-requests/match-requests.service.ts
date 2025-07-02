import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { MatchRequest, MatchRequestStatus } from '../entities/match-request.entity';
import { CreateMatchRequestDto } from './dto/create-match-request.dto';
import { MatchRequestDto } from './dto/match-request.dto';

@Injectable()
export class MatchRequestsService {
  constructor(
    @InjectRepository(MatchRequest)
    private matchRequestRepository: Repository<MatchRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createMatchRequest(
    menteeId: string,
    createMatchRequestDto: CreateMatchRequestDto,
  ): Promise<MatchRequestDto> {
    const { mentorId, message } = createMatchRequestDto;

    const mentee = await this.userRepository.findOne({ where: { id: menteeId } });
    if (!mentee || mentee.role !== UserRole.MENTEE) {
      throw new BadRequestException('멘티만 매칭 요청을 보낼 수 있습니다.');
    }

    const mentor = await this.userRepository.findOne({ where: { id: mentorId } });
    if (!mentor || mentor.role !== UserRole.MENTOR) {
      throw new NotFoundException('멘토를 찾을 수 없습니다.');
    }

    const existingRequest = await this.matchRequestRepository.findOne({
      where: { menteeId, mentorId },
    });
    if (existingRequest) {
      throw new ConflictException('이미 해당 멘토에게 요청을 보냈습니다.');
    }

    const pendingRequests = await this.matchRequestRepository.count({
      where: { menteeId, status: MatchRequestStatus.PENDING },
    });
    if (pendingRequests > 0) {
      throw new ConflictException('이미 대기 중인 매칭 요청이 있습니다.');
    }

    const acceptedMentorRequest = await this.matchRequestRepository.findOne({
      where: { mentorId, status: MatchRequestStatus.ACCEPTED },
    });
    if (acceptedMentorRequest) {
      throw new ConflictException('해당 멘토는 이미 다른 멘티와 매칭되어 있습니다.');
    }

    const matchRequest = this.matchRequestRepository.create({
      mentorId,
      menteeId,
      message,
      status: MatchRequestStatus.PENDING,
    });

    await this.matchRequestRepository.save(matchRequest);

    return this.toMatchRequestDto(matchRequest, mentor, mentee);
  }

  async getIncomingRequests(mentorId: string): Promise<MatchRequestDto[]> {
    const requests = await this.matchRequestRepository.find({
      where: { mentorId },
      relations: ['mentee'],
      order: { createdAt: 'DESC' },
    });

    const mentor = await this.userRepository.findOne({ where: { id: mentorId } });

    return requests.map(request => 
      this.toMatchRequestDto(request, mentor, request.mentee),
    );
  }

  async getOutgoingRequests(menteeId: string): Promise<MatchRequestDto[]> {
    const requests = await this.matchRequestRepository.find({
      where: { menteeId },
      relations: ['mentor'],
      order: { createdAt: 'DESC' },
    });

    const mentee = await this.userRepository.findOne({ where: { id: menteeId } });

    return requests.map(request => 
      this.toMatchRequestDto(request, request.mentor, mentee),
    );
  }

  async acceptRequest(mentorId: string, requestId: string): Promise<MatchRequestDto> {
    const request = await this.matchRequestRepository.findOne({
      where: { id: requestId, mentorId },
      relations: ['mentor', 'mentee'],
    });

    if (!request) {
      throw new NotFoundException('매칭 요청을 찾을 수 없습니다.');
    }

    if (request.status !== MatchRequestStatus.PENDING) {
      throw new BadRequestException('대기 중인 요청만 수락할 수 있습니다.');
    }

    const existingAccepted = await this.matchRequestRepository.findOne({
      where: { mentorId, status: MatchRequestStatus.ACCEPTED },
    });
    if (existingAccepted) {
      throw new ConflictException('이미 다른 멘티와 매칭되어 있습니다.');
    }

    request.status = MatchRequestStatus.ACCEPTED;
    await this.matchRequestRepository.save(request);

    return this.toMatchRequestDto(request, request.mentor, request.mentee);
  }

  async rejectRequest(mentorId: string, requestId: string): Promise<MatchRequestDto> {
    const request = await this.matchRequestRepository.findOne({
      where: { id: requestId, mentorId },
      relations: ['mentor', 'mentee'],
    });

    if (!request) {
      throw new NotFoundException('매칭 요청을 찾을 수 없습니다.');
    }

    if (request.status !== MatchRequestStatus.PENDING) {
      throw new BadRequestException('대기 중인 요청만 거절할 수 있습니다.');
    }

    request.status = MatchRequestStatus.REJECTED;
    await this.matchRequestRepository.save(request);

    return this.toMatchRequestDto(request, request.mentor, request.mentee);
  }

  async cancelRequest(menteeId: string, requestId: string): Promise<void> {
    const request = await this.matchRequestRepository.findOne({
      where: { id: requestId, menteeId },
    });

    if (!request) {
      throw new NotFoundException('매칭 요청을 찾을 수 없습니다.');
    }

    if (request.status !== MatchRequestStatus.PENDING) {
      throw new BadRequestException('대기 중인 요청만 취소할 수 있습니다.');
    }

    await this.matchRequestRepository.remove(request);
  }

  private toMatchRequestDto(
    request: MatchRequest,
    mentor: User,
    mentee: User,
  ): MatchRequestDto {
    return {
      id: request.id,
      mentorId: request.mentorId,
      mentorName: mentor?.name || '',
      mentorProfileImage: mentor?.profileImage,
      menteeId: request.menteeId,
      menteeName: mentee?.name || '',
      menteeProfileImage: mentee?.profileImage,
      status: request.status,
      message: request.message,
      createdAt: request.createdAt,
    };
  }
}