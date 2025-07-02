import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateMatchRequestDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  mentorId: string;

  @ApiProperty({ 
    example: '안녕하세요. React를 배우고 싶은 멘티입니다. 도움을 주시면 감사하겠습니다.',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}