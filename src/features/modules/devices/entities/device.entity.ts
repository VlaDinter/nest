import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid', { name: 'device_id' })
  public deviceId: string;

  @Column()
  public ip: string;

  @Column()
  public title: string;

  @Column({ name: 'last_active_date' })
  public lastActiveDate: string;

  @Column({ name: 'user_id' })
  public userId: string;

  @ManyToOne('User', { cascade: true })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_id',
  })
  public user: User;
}
