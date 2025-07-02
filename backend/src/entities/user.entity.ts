import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { MatchRequest } from './match-request.entity';

export enum UserRole {
  MENTOR = 'mentor',
  MENTEE = 'mentee',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ nullable: true })
  bio?: string;

  @Column('simple-array', { nullable: true })
  techStack?: string[];

  @Column({ nullable: true })
  profileImage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MatchRequest, (matchRequest) => matchRequest.mentor)
  mentorRequests: MatchRequest[];

  @OneToMany(() => MatchRequest, (matchRequest) => matchRequest.mentee)
  menteeRequests: MatchRequest[];
}