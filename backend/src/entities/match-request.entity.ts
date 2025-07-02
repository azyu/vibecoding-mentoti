import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum MatchRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('match_requests')
export class MatchRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.mentorRequests)
  @JoinColumn({ name: 'mentorId' })
  mentor: User;

  @Column()
  mentorId: string;

  @ManyToOne(() => User, (user) => user.menteeRequests)
  @JoinColumn({ name: 'menteeId' })
  mentee: User;

  @Column()
  menteeId: string;

  @Column({
    type: 'enum',
    enum: MatchRequestStatus,
    default: MatchRequestStatus.PENDING,
  })
  status: MatchRequestStatus;

  @Column({ nullable: true })
  message?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}