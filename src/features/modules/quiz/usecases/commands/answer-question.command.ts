export class AnswerQuestionCommand {
  constructor(
    public readonly userId: string,
    public readonly answer: string,
  ) {}
}
