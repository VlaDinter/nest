import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from './answer.entity';
import { GameQuestion } from './game-question.entity';
import { IGameStatus } from '../interfaces/game-status.interface';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('enum', {
    enum: IGameStatus,
    default: IGameStatus.PENDING_SECOND_PLAYER,
  })
  public status: IGameStatus;

  @Column({ name: 'first_player_id', type: 'uuid' })
  public firstPlayerId: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'first_player_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'first_player_id',
  })
  public firstPlayer: User;

  @Column({ name: 'first_player_score', default: 0 })
  public firstPlayerScore: number;

  @Column({ name: 'second_player_id', type: 'uuid', nullable: true })
  public secondPlayerId: string | null;

  @ManyToOne('User', { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'second_player_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'second_player_id',
  })
  public secondPlayer: User | null;

  @Column({ name: 'second_player_score', default: 0 })
  public secondPlayerScore: number;

  @CreateDateColumn({ name: 'pair_created_date', type: 'timestamptz' })
  public pairCreatedDate: Date;

  @Column({ name: 'start_game_date', type: 'timestamptz', nullable: true })
  public startGameDate: Date | null;

  @Column({ name: 'finish_game_date', type: 'timestamptz', nullable: true })
  public finishGameDate: Date | null;

  @OneToMany('GameQuestion', 'game')
  public questions: GameQuestion[];

  @OneToMany('Answer', 'game')
  public answers: Answer[];
}
