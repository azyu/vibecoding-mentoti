import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty({ 
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: '홍길동',
      role: 'mentee'
    }
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}