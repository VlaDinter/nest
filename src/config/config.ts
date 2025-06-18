import Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { configUtility } from './config.utility';
import { getConfiguration } from '../configuration/configuration';
import { ISortDirections } from '../features/base/interfaces/sort-directions.interface';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [getConfiguration],
  envFilePath: configUtility.detectENVFile(),
  ignoreEnvFile: !process.env.NODE_ENV,
  validationSchema: Joi.object({
    MONGO_URI: Joi.string().uri().required(),
    SORT_BY: Joi.string().default('createdAt'),
    PAGE_SIZE: Joi.number().greater(0).default(10),
    PAGE_NUMBER: Joi.number().greater(0).default(1),
    NAME_MAX_LENGTH: Joi.number().greater(0).default(15),
    LOGIN_MIN_LENGTH: Joi.number().greater(0).default(3),
    LOGIN_MAX_LENGTH: Joi.number().greater(0).default(10),
    TITLE_MAX_LENGTH: Joi.number().greater(0).default(30),
    PASSWORD_MIN_LENGTH: Joi.number().greater(0).default(6),
    COMMENT_MIN_LENGTH: Joi.number().greater(0).default(20),
    COMMENT_MAX_LENGTH: Joi.number().greater(0).default(300),
    PASSWORD_MAX_LENGTH: Joi.number().greater(0).default(20),
    CONTENT_MAX_LENGTH: Joi.number().greater(0).default(1000),
    WEBSITE_URL_MAX_LENGTH: Joi.number().greater(0).default(100),
    DESCRIPTION_MAX_LENGTH: Joi.number().greater(0).default(500),
    SHORT_DESCRIPTION_MAX_LENGTH: Joi.number().greater(0).default(100),
    SORT_DIRECTION: Joi.string()
      .valid(ISortDirections.ASC, ISortDirections.DESC)
      .default(ISortDirections.DESC),
  }),
});
