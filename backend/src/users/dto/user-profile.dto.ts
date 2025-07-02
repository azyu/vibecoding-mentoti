import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class UserProfileDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MENTEE })
  role: UserRole;

  @ApiProperty({ example: '안녕하세요. 프로그래밍을 배우고 싶은 멘티입니다.', required: false })
  bio?: string;

  @ApiProperty({ 
    type: [String], 
    example: ['JavaScript', 'React', 'Node.js'], 
    required: false 
  })
  techStack?: string[];

  @ApiProperty({ 
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    required: false 
  })
  profileImage?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}