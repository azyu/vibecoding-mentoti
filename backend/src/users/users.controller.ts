import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { MentorListQueryDto, MentorListResponseDto } from './dto/mentor-list.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ status: 200, description: '조회 성공', type: UserProfileDto })
  async getMyProfile(@CurrentUser('id') userId: string): Promise<UserProfileDto> {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: '프로필 수정' })
  @ApiResponse({ status: 200, description: '수정 성공', type: UserProfileDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Get('mentors')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTEE)
  @ApiOperation({ summary: '멘토 목록 조회 (멘티 전용)' })
  @ApiResponse({ status: 200, description: '조회 성공', type: MentorListResponseDto })
  async getMentorList(
    @CurrentUser('id') menteeId: string,
    @Query() query: MentorListQueryDto,
  ): Promise<MentorListResponseDto> {
    return this.usersService.getMentorList(menteeId, query);
  }
}