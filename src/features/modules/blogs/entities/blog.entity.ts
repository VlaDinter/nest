import {
  Column,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  nameConstraints,
  websiteUrlConstraints,
  descriptionConstraints,
} from '../constants/constants';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  //@Index('blog_name', { synchronize: false })
  @Column({ length: nameConstraints.maxLength })
  public name: string;

  @Column({ length: descriptionConstraints.maxLength })
  public description: string;

  @Column({ name: 'website_url', length: websiteUrlConstraints.maxLength })
  public websiteUrl: string;

  @Column({ name: 'is_membership', default: false })
  public isMembership: boolean;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: string;
}
