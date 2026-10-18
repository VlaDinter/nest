import { Injectable } from '@nestjs/common';
import { EntityManager, ILike } from 'typeorm';
import { validate as isValidUUID } from 'uuid';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Question } from '../entities/question.entity';
import { questionsSortFields } from '../constants/constants';
import { QuestionInputModel } from '../models/input/question-input.model';
import { QuestionViewModel } from '../models/output/question-view.model';
import { IPublishedStatus } from '../interfaces/published-status.interface';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IQuestionsPaginationParams } from '../interfaces/questions-pagination-params.interface';

@Injectable()
export class QuestionsTypeormRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findQuestions(
    params: IQuestionsPaginationParams,
  ): Promise<IPagination<QuestionViewModel>> {
    const result = this.entityManager.createQueryBuilder(Question, 'question');

    if (params.bodySearchTerm) {
      result.andWhere({ body: ILike(`%${params.bodySearchTerm}%`) });
    }

    if (params.publishedStatus !== IPublishedStatus.ALL) {
      result.andWhere({
        published: params.publishedStatus === IPublishedStatus.PUBLISHED,
      });
    }

    const sortBy = questionsSortFields.includes(params.sortBy)
      ? params.sortBy
      : 'createdAt';

    const [questions, totalCount] = await result
      .orderBy(
        `question.${sortBy}`,
        params.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((params.pageNumber - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    return {
      totalCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      pagesCount: Math.ceil(totalCount / params.pageSize),
      items: questions.map(this.mapToViewModel),
    };
  }

  findQuestion(questionId: string): Promise<Question | null> {
    if (!isValidUUID(questionId)) {
      return Promise.resolve(null);
    }

    return this.entityManager.findOneBy(Question, { id: questionId });
  }

  async createQuestion(dto: QuestionInputModel): Promise<QuestionViewModel> {
    const question = this.entityManager.create(Question, {
      body: dto.body,
      correctAnswers: dto.correctAnswers,
    });

    await this.entityManager.save(Question, question);

    return this.mapToViewModel(question);
  }

  async updateQuestion(
    questionId: string,
    dto: Partial<Pick<Question, 'body' | 'correctAnswers' | 'published'>>,
  ): Promise<boolean> {
    if (!isValidUUID(questionId)) {
      return false;
    }

    const result = await this.entityManager.update(Question, questionId, {
      ...dto,
      updatedAt: new Date(),
    });

    return !!result.affected;
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    if (!isValidUUID(questionId)) {
      return false;
    }

    const result = await this.entityManager.delete(Question, questionId);

    return !!result.affected;
  }

  findRandomPublishedQuestions(
    count: number,
    manager: EntityManager = this.entityManager,
  ): Promise<Question[]> {
    return manager
      .createQueryBuilder(Question, 'question')
      .where({ published: true })
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }

  async deleteAll(): Promise<void> {
    await this.entityManager
      .createQueryBuilder()
      .delete()
      .from(Question)
      .execute();
  }

  private mapToViewModel(question: Question): QuestionViewModel {
    return {
      id: question.id,
      body: question.body,
      published: question.published,
      correctAnswers: question.correctAnswers,
      createdAt: new Date(question.createdAt).toISOString(),
      updatedAt: question.updatedAt
        ? new Date(question.updatedAt).toISOString()
        : null,
    };
  }
}
