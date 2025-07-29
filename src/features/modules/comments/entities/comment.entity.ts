import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Like } from './like.entity';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public content: string;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: string;

  @Column({ name: 'post_id' })
  public postId: string;

  @ManyToOne('Post', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'post_id',
  })
  post: Post;

  @Column({ name: 'user_id' })
  public userId: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_id',
  })
  user: User;

  @OneToMany('Like', 'comment', { onDelete: 'CASCADE' })
  likes: Like[];
}
