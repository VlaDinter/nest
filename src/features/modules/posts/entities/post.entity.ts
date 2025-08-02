import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';
import { Like } from '../../comments/entities/like.entity';
import {
  titleConstraints,
  contentConstraints,
  shortDescriptionConstraints,
} from '../constants/constants';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ length: titleConstraints.maxLength })
  public title: string;

  @Column({
    name: 'short_description',
    length: shortDescriptionConstraints.maxLength,
  })
  public shortDescription: string;

  @Column({ length: contentConstraints.maxLength })
  public content: string;

  @Column({ name: 'blog_id' })
  public blogId: string;

  @ManyToOne('Blog', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'blog_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'blog_id',
  })
  public blog: Blog;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: string;

  @OneToMany('Like', 'post')
  public likes: Like[];
}
