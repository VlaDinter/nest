import { Injectable } from '@nestjs/common';
import { Question } from '../entities/question.entity';
import { QuestionInputModel } from '../models/input/question-input.model';
import { QuestionViewModel } from '../models/output/question-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { QuestionsTypeormRepository } from '../infrastructure/questions.typeorm.repository';
import { IQuestionsPaginationParams } from '../interfaces/questions-pagination-params.interface';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly questionsRepository: QuestionsTypeormRepository,
  ) {}

  getQuestions(
    params: IQuestionsPaginationParams,
  ): Promise<IPagination<QuestionViewModel>> {
    return this.questionsRepository.findQuestions(params);
  }

  getQuestion(questionId: string): Promise<Question | null> {
    return this.questionsRepository.findQuestion(questionId);
  }

  addQuestion(dto: QuestionInputModel): Promise<QuestionViewModel> {
    return this.questionsRepository.createQuestion(dto);
  }

  editQuestion(questionId: string, dto: QuestionInputModel): Promise<boolean> {
    return this.questionsRepository.updateQuestion(questionId, {
      body: dto.body,
      correctAnswers: dto.correctAnswers,
    });
  }

  publishQuestion(questionId: string, published: boolean): Promise<boolean> {
    return this.questionsRepository.updateQuestion(questionId, { published });
  }

  removeQuestion(questionId: string): Promise<boolean> {
    return this.questionsRepository.deleteQuestion(questionId);
  }

  async removeAll(): Promise<void> {
    await this.questionsRepository.deleteAll();
  }
}
