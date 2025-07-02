import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsBase64, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: '홍길동', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '안녕하세요. 프로그래밍을 배우고 싶은 멘티입니다.', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ 
    type: [String], 
    example: ['JavaScript', 'React', 'Node.js'], 
    required: false,
    description: '멘토인 경우에만 수정 가능'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @ApiProperty({ 
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    required: false,
    description: 'Base64 인코딩된 이미지 (최대 5MB)'
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}