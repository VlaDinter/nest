export const jwtConstants = {
  secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'staging-secret',
};

export const basicConstants = {
  userName: process.env.SA_LOGIN || 'sa',
  password: process.env.PASSWORD || '123',
};
