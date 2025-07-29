import {
  Index,
  Column,
  Entity,
  Unique,
  OneToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { loginConstraints } from '../constants/constants';
import { EmailConfirmation } from './email-confirmation.entity';

@Entity()
@Index(['login', 'email'], { unique: true })
@Unique('one_login_for_one_user_email', ['login', 'email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    unique: true,
    length: loginConstraints.maxLength,
  })
  public login: string;

  @Column({ unique: true })
  public email: string;

  @Column({ name: 'password_hash' })
  public passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: string;

  @OneToOne(
    () => EmailConfirmation,
    (emailConfirmation: EmailConfirmation) => emailConfirmation.user,
    {
      onDelete: 'CASCADE',
    },
  )
  public emailConfirmation: EmailConfirmation;
}
