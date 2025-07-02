import { ApiProperty } from '@nestjs/swagger';
import { MatchRequestStatus } from '../../entities/match-request.entity';

export class MatchRequestDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  mentorId: string;

  @ApiProperty({ example: '홍길동' })
  mentorName: string;

  @ApiProperty({ 
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    required: false 
  })
  mentorProfileImage?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  menteeId: string;

  @ApiProperty({ example: '김철수' })
  menteeName: string;

  @ApiProperty({ 
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    required: false 
  })
  menteeProfileImage?: string;

  @ApiProperty({ enum: MatchRequestStatus, example: MatchRequestStatus.PENDING })
  status: MatchRequestStatus;

  @ApiProperty({ 
    example: '안녕하세요. React를 배우고 싶은 멘티입니다.',
    required: false 
  })
  message?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}