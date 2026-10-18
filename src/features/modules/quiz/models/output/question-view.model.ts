export class QuestionViewModel {
  id: string;
  body: string;
  published: boolean;
  createdAt: string;
  updatedAt: string | null;
  correctAnswers: string[];
}
