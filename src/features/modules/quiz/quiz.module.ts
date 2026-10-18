import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';
import { GamesService } from './application/games.service';
import { GameQuestion } from './entities/game-question.entity';
import { QuestionsController } from './api/questions.controller';
import { QuestionsService } from './application/questions.service';
import { PairGameQuizController } from './api/pair-game-quiz.controller';
import { AnswerQuestionUseCase } from './usecases/answer-question.usecase';
import { ConnectToGameUseCase } from './usecases/connect-to-game.usecase';
import { GamesTypeormRepository } from './infrastructure/games.typeorm.repository';
import { QuestionsTypeormRepository } from './infrastructure/questions.typeorm.repository';

const useCases = [ConnectToGameUseCase, AnswerQuestionUseCase];

// SQL only: the quiz game relies on Postgres transactions and row locks.
@Module({
  imports: [TypeOrmModule.forFeature([Question, Game, GameQuestion, Answer])],
  controllers: [QuestionsController, PairGameQuizController],
  providers: [
    GamesService,
    QuestionsService,
    GamesTypeormRepository,
    QuestionsTypeormRepository,
    ...useCases,
  ],
  exports: [GamesService, QuestionsService],
})
export class QuizModule {}
