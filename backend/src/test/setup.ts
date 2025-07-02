import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { MatchRequest } from '../entities/match-request.entity';

export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [User, MatchRequest],
  synchronize: true,
  logging: false,
});