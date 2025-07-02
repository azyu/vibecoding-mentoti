import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';

export enum MentorSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt',
}

export class MentorListQueryDto {
  @ApiProperty({ required: false, description: '이름으로 검색' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    type: [String], 
    required: false, 
    description: '기술 스택으로 필터링 (여러 개 가능)',
    example: ['JavaScript', 'React']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @ApiProperty({ 
    enum: MentorSortBy, 
    required: false,
    default: MentorSortBy.CREATED_AT 
  })
  @IsOptional()
  @IsEnum(MentorSortBy)
  sortBy?: MentorSortBy = MentorSortBy.CREATED_AT;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10, maximum: 50 })
  @IsOptional()
  limit?: number = 10;
}

export class MentorDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'mentor@example.com' })
  email: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: '경험이 풍부한 풀스택 개발자입니다.' })
  bio?: string;

  @ApiProperty({ 
    type: [String], 
    example: ['JavaScript', 'React', 'Node.js'] 
  })
  techStack: string[];

  @ApiProperty({ 
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    required: false 
  })
  profileImage?: string;

  @ApiProperty({ example: false })
  isMatched: boolean;
}

export class MentorListResponseDto {
  @ApiProperty({ type: [MentorDto] })
  data: MentorDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}