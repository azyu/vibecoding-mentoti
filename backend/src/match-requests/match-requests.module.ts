import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchRequestsController } from './match-requests.controller';
import { MatchRequestsService } from './match-requests.service';
import { MatchRequest } from '../entities/match-request.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatchRequest, User])],
  controllers: [MatchRequestsController],
  providers: [MatchRequestsService],
})
export class MatchRequestsModule {}