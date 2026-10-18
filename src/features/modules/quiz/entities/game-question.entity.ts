import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class GameQuestion {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public position: number;

  @Column({ name: 'game_id', type: 'uuid' })
  public gameId: string;

  @ManyToOne('Game', 'questions', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'game_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'game_id',
  })
  public game: Game;

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
