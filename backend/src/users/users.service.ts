import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { MatchRequest, MatchRequestStatus } from '../entities/match-request.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { MentorListQueryDto, MentorListResponseDto, MentorDto } from './dto/mentor-list.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MatchRequest)
    private matchRequestRepository: Repository<MatchRequest>,
  ) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.toUserProfileDto(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (updateProfileDto.techStack && user.role !== UserRole.MENTOR) {
      throw new BadRequestException('멘티는 기술 스택을 설정할 수 없습니다.');
    }

    if (updateProfileDto.profileImage) {
      const base64Data = updateProfileDto.profileImage.split(',')[1] || updateProfileDto.profileImage;
      const buffer = Buffer.from(base64Data, 'base64');
      
      if (buffer.length > 5 * 1024 * 1024) {
        throw new BadRequestException('프로필 이미지는 5MB를 초과할 수 없습니다.');
      }
    }

    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);

    return this.toUserProfileDto(user);
  }

  async getMentorList(
    menteeId: string,
    query: MentorListQueryDto,
  ): Promise<MentorListResponseDto> {
    const { name, techStack, sortBy, page = 1, limit = 10 } = query;
    
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.MENTOR });

    if (name) {
      queryBuilder.andWhere('user.name LIKE :name', { name: `%${name}%` });
    }

    if (techStack && techStack.length > 0) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM unnest(user.techStack) as tech WHERE tech = ANY(:techStack))',
        { techStack },
      );
    }

    const sortField = sortBy === 'name' ? 'user.name' : 'user.createdAt';
    queryBuilder.orderBy(sortField, 'ASC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [mentors, total] = await queryBuilder.getManyAndCount();

    const acceptedMentorIds = await this.matchRequestRepository
      .createQueryBuilder('match')
      .select('match.mentorId')
      .where('match.status = :status', { status: MatchRequestStatus.ACCEPTED })
      .getRawMany()
      .then(results => results.map(r => r.match_mentorId));

    const data: MentorDto[] = mentors.map(mentor => ({
      id: mentor.id,
      name: mentor.name,
      bio: mentor.bio,
      techStack: mentor.techStack || [],
      profileImage: mentor.profileImage,
      isMatched: acceptedMentorIds.includes(mentor.id),
    }));

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toUserProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      bio: user.bio,
      techStack: user.techStack,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}