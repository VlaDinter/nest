import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { ILikeStatus } from '../../../base/interfaces/like-status.interface';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'added_at' })
  public addedAt: string;

  @Column('enum', { enum: ILikeStatus })
  public status: ILikeStatus;

  @Column({ name: 'user_id' })
  public userId: string;

  @ManyToOne('User', { cascade: true })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_id',
  })
  public user: User;

  @Column({ name: 'post_id', nullable: true })
  public postId: string | null;

  @ManyToOne('Post', 'likes', { nullable: true, cascade: true })
  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'post_id',
  })
  public post: Post | null;

  @Column({ name: 'comment_id', nullable: true })
  public commentId: string | null;

  @ManyToOne('Comment', 'likes', { nullable: true, cascade: true })
  @JoinColumn({
    name: 'comment_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'comment_id',
  })
  public comment: Comment | null;
}
