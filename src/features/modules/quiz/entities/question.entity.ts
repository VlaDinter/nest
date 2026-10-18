import {
  Check,
  Column,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { bodyConstraints } from '../constants/constants';

@Entity()
@Check(`char_length(body) >= ${bodyConstraints.minLength}`)
export class Question {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ length: bodyConstraints.maxLength })
  public body: string;

  @Column('jsonb', { name: 'correct_answers' })
  public correctAnswers: string[];

  @Column({ default: false })
  public published: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', nullable: true })
  public updatedAt: Date | null;
}
