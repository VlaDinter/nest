import {
  Get,
  Put,
  Post,
  Body,
  Query,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuestionsService } from '../application/questions.service';
import { PublishInputModel } from '../models/input/publish-input.model';
import { QuestionInputModel } from '../models/input/question-input.model';
import { QuestionViewModel } from '../models/output/question-view.model';
import { IPublishedStatus } from '../interfaces/published-status.interface';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { BadFieldsException } from '../../../common/exceptions/bad-fields.exception';
import { ParseNumberPipe } from '../../../common/pipes/parse-number.pipe';
import { ParseStringPipe } from '../../../common/pipes/parse-string.pipe';
import { ParseValuesPipe } from '../../../common/pipes/parse-values.pipe';
import { getConfiguration } from '../../../../configuration/configuration';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { BasicAuthGuard } from '../../../common/guards/basic/basic-auth.guard';
import { ISortDirections } from '../../../base/interfaces/sort-directions.interface';

@ApiTags('QuizQuestions')
@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Api('Get questions', false, true)
  @Get()
  getQuestions(
    @Query('bodySearchTerm', ParseStringPipe) bodySearchTerm: string,
    @Query(
      'publishedStatus',
      ParseStringPipe,
      new ParseValuesPipe(Object.values(IPublishedStatus)),
      new DefaultValuePipe(IPublishedStatus.ALL),
    )
    publishedStatus: IPublishedStatus,
    @Query(
      'pageSize',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageSize),
    )
    pageSize: number,
    @Query(
      'pageNumber',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageNumber),
    )
    pageNumber: number,
    @Query(
      'sortBy',
      ParseStringPipe,
      new DefaultValuePipe(getConfiguration().sortBy),
    )
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new ParseValuesPipe([ISortDirections.ASC, ISortDirections.DESC]),
      new DefaultValuePipe(getConfiguration().sortDirection),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<QuestionViewModel>> {
    return this.questionsService.getQuestions({
      sortBy,
      pageSize,
      pageNumber,
      sortDirection,
      bodySearchTerm,
      publishedStatus,
    });
  }

  @Api('Post question', false, true)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  postQuestion(
    @Body() inputModel: QuestionInputModel,
  ): Promise<QuestionViewModel> {
    return this.questionsService.addQuestion(inputModel);
  }

  @Api('Put question', true, true)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putQuestion(
    @Param('id') questionId: string,
    @Body() inputModel: QuestionInputModel,
  ): Promise<void> {
    const question = await this.questionsService.getQuestion(questionId);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.published && !inputModel.correctAnswers.length) {
      throw new BadFieldsException([
        {
          field: 'correctAnswers',
          message: 'Published question must have correct answers',
        },
      ]);
    }

    await this.questionsService.editQuestion(questionId, inputModel);
  }

  @Api('Publish question', true, true)
  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param('id') questionId: string,
    @Body() inputModel: PublishInputModel,
  ): Promise<void> {
    const question = await this.questionsService.getQuestion(questionId);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (inputModel.published && !question.correctAnswers.length) {
      throw new BadFieldsException([
        {
          field: 'correctAnswers',
          message: 'Question without correct answers cannot be published',
        },
      ]);
    }

    await this.questionsService.publishQuestion(
      questionId,
      inputModel.published,
    );
  }

  @Api('Delete question', true, true)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') questionId: string): Promise<void> {
    const isDeleted = await this.questionsService.removeQuestion(questionId);

    if (!isDeleted) {
      throw new NotFoundException('Question not found');
    }
  }
}
