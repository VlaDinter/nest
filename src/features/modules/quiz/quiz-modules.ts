import { QuizModule } from './quiz.module';
import { IRepoType } from '../../base/interfaces/repo-type.interface';
import { getConfiguration } from '../../../configuration/configuration';

export const quizModules =
  getConfiguration().repoType === IRepoType.SQL ? [QuizModule] : [];
