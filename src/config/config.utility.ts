import { join } from 'path';
import { IEnvironments } from '@src/features/base/interfaces/environments.interface';

export const configUtility = {
  detectENVFile: (): string[] => {
    const envFilePath = [process.env.ENV_FILE_PATH?.trim() || ''];

    switch (process.env.NODE_ENV) {
      case IEnvironments.TESTING:
      case IEnvironments.DEVELOPMENT:
        envFilePath.push(join(__dirname, '..', 'env', '.env.local'));
        envFilePath.push(join(__dirname, '..', 'env', '.env'));
        envFilePath.push(
          join(__dirname, '..', 'env', `.env.${process.env.NODE_ENV}.local`),
        );

        envFilePath.push(
          join(__dirname, '..', 'env', `.env.${process.env.NODE_ENV}`),
        );

        break;

      case IEnvironments.STAGING:
      case IEnvironments.PRODUCTION:
        envFilePath.push(join(__dirname, '..', 'env', '.env'));
        envFilePath.push(
          join(__dirname, '..', 'env', `.env.${process.env.NODE_ENV}`),
        );

        break;
    }

    return envFilePath;
  },
};
