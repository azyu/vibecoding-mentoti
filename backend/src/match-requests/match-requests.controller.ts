import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MatchRequestsService } from './match-requests.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../entities/user.entity';
import { CreateMatchRequestDto } from './dto/create-match-request.dto';
import { MatchRequestDto } from './dto/match-request.dto';

@ApiTags('Match Requests')
@ApiBearerAuth()
@Controller('match-requests')
export class MatchRequestsController {
  constructor(private matchRequestsService: MatchRequestsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTEE)
  @ApiOperation({ summary: '매칭 요청 보내기 (멘티 전용)' })
  @ApiResponse({ status: 201, description: '요청 성공', type: MatchRequestDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '중복 요청 또는 제약사항 위반' })
  async createMatchRequest(
    @CurrentUser('id') menteeId: string,
    @Body() createMatchRequestDto: CreateMatchRequestDto,
  ): Promise<MatchRequestDto> {
    return this.matchRequestsService.createMatchRequest(menteeId, createMatchRequestDto);
  }

  @Get('incoming')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: '받은 매칭 요청 목록 (멘토 전용)' })
  @ApiResponse({ status: 200, description: '조회 성공', type: [MatchRequestDto] })
  async getIncomingRequests(
    @CurrentUser('id') mentorId: string,
  ): Promise<MatchRequestDto[]> {
    return this.matchRequestsService.getIncomingRequests(mentorId);
  }

  @Get('outgoing')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTEE)
  @ApiOperation({ summary: '보낸 매칭 요청 목록 (멘티 전용)' })
  @ApiResponse({ status: 200, description: '조회 성공', type: [MatchRequestDto] })
  async getOutgoingRequests(
    @CurrentUser('id') menteeId: string,
  ): Promise<MatchRequestDto[]> {
    return this.matchRequestsService.getOutgoingRequests(menteeId);
  }

  @Put(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: '매칭 요청 수락 (멘토 전용)' })
  @ApiResponse({ status: 200, description: '수락 성공', type: MatchRequestDto })
  @ApiResponse({ status: 404, description: '요청을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 다른 멘티와 매칭됨' })
  async acceptRequest(
    @CurrentUser('id') mentorId: string,
    @Param('id') requestId: string,
  ): Promise<MatchRequestDto> {
    return this.matchRequestsService.acceptRequest(mentorId, requestId);
  }

  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: '매칭 요청 거절 (멘토 전용)' })
  @ApiResponse({ status: 200, description: '거절 성공', type: MatchRequestDto })
  @ApiResponse({ status: 404, description: '요청을 찾을 수 없음' })
  async rejectRequest(
    @CurrentUser('id') mentorId: string,
    @Param('id') requestId: string,
  ): Promise<MatchRequestDto> {
    return this.matchRequestsService.rejectRequest(mentorId, requestId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTEE)
  @ApiOperation({ summary: '매칭 요청 취소 (멘티 전용)' })
  @ApiResponse({ status: 204, description: '취소 성공' })
  @ApiResponse({ status: 404, description: '요청을 찾을 수 없음' })
  async cancelRequest(
    @CurrentUser('id') menteeId: string,
    @Param('id') requestId: string,
  ): Promise<void> {
    return this.matchRequestsService.cancelRequest(menteeId, requestId);
  }
}