export const getConfiguration = () => {
  return {
    sortBy: process.env.SORT_BY,
    databaseUrl: process.env.PGURL,
    repoType: process.env.REPO_TYPE,
    pageSize: Number(process.env.PAGE_SIZE),
    sortDirection: process.env.SORT_DIRECTION,
    pageNumber: Number(process.env.PAGE_NUMBER),
  };
};

type ConfigurationType = ReturnType<typeof getConfiguration>;

export type ConfigType = ConfigurationType & {
  PORT: number;
  PGPORT: number;
  PGHOST: string;
  PGUSER: string;
  SA_LOGIN: string;
  NODE_ENV: string;
  MONGO_URI: string;
  PGDATABASE: string;
  PGPASSWORD: string;
  EMAIL_FROM: string;
  SA_PASSWORD: string;
  THROTTLE_TTL: number;
  MONGO_DB_NAME: string;
  THROTTLE_LIMIT: number;
  EMAIL_FROM_USER: string;
  EMAIL_FROM_SERVICE: string;
  EMAIL_FROM_PASSWORD: string;
  IS_SWAGGER_ENABLED: boolean;
  INCLUDE_TESTING_MODULE: boolean;
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;
};
