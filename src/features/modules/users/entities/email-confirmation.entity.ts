import { Column, Entity, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('Confirmations')
export class EmailConfirmation {
  @PrimaryColumn()
  public id: string;

  @Column({ name: 'confirmation_code' })
  public confirmationCode: string;

  @Column({ name: 'expiration_date', type: 'timestamptz' })
  public expirationDate: Date;

  @Column({ name: 'is_confirmed' })
  public isConfirmed: boolean;

  @Column({ name: 'user_id' })
  public userId: string;

  @OneToOne(() => User, (user: User) => user.emailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_id',
  })
  public user: User;
}
