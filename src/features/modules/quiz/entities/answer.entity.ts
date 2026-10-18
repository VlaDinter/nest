import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';
import { User } from '../../users/entities/user.entity';
import { IAnswerStatus } from '../interfaces/answer-status.interface';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('enum', { enum: IAnswerStatus })
  public status: IAnswerStatus;

  @Column({ name: 'added_at', type: 'timestamptz' })
  public addedAt: Date;

  @Column({ name: 'game_id', type: 'uuid' })
  public gameId: string;

  @ManyToOne('Game', 'answers', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'game_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'game_id',
  })
  public game: Game;

  @Column({ name: 'user_id', type: 'uuid' })
  public userId: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_id',
  })
  public user: User;

  @Column({ name: 'question_id', type: 'uuid' })
  public questionId: string;

  @ManyToOne('Question', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'question_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'question_id',
  })
  public question: Question;
}
