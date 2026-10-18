export const bodyConstraints = {
  minLength: 10,
  maxLength: 500,
};

export const gameQuestionsCount = 5;

export const answerTimeoutMs = 10_000;

export const connectionLockKey = 25;

export const gamesSortFields = [
  'status',
  'pairCreatedDate',
  'startGameDate',
  'finishGameDate',
];

export const questionsSortFields = [
  'body',
  'published',
  'createdAt',
  'updatedAt',
];
