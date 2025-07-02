import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsArray } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MENTEE })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '안녕하세요. 프로그래밍을 배우고 싶은 멘티입니다.', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ 
    type: [String], 
    example: ['JavaScript', 'React', 'Node.js'], 
    required: false,
    description: '멘토인 경우 필수'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];
}