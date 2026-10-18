import { IAnswerStatus } from '../../interfaces/answer-status.interface';

export class AnswerViewModel {
  addedAt: string;
  questionId: string;
  answerStatus: IAnswerStatus;
}
