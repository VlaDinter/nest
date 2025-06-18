import { IsNumber } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseConfig } from '../../../../config/base.config';
import { PostsConfigType } from '../configuration/posts.configuration';

@Injectable()
export class PostsConfig extends BaseConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable NEWEST_LIKES_LENGTH, example: 3',
    },
  )
  newestLikesLength: number;

  constructor(private configService: ConfigService<PostsConfigType, true>) {
    super();

    this.newestLikesLength = this.getNumber(
      'NEWEST_LIKES_LENGTH',
      this.configService.get('NEWEST_LIKES_LENGTH', { infer: true }),
      3,
    );

    this.validateConfig(this);
  }
}
