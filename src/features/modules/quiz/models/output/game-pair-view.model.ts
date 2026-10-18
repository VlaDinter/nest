import { AnswerViewModel } from './answer-view.model';
import { IGameStatus } from '../../interfaces/game-status.interface';

export class PlayerViewModel {
  id: string;
  login: string;
}

export class GamePlayerProgressViewModel {
  score: number;
  player: PlayerViewModel;
  answers: AnswerViewModel[];
}

export class GameQuestionViewModel {
  id: string;
  body: string;
}

export class GamePairViewModel {
  id: string;
  status: IGameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
  questions: GameQuestionViewModel[] | null;
  firstPlayerProgress: GamePlayerProgressViewModel;
  secondPlayerProgress: GamePlayerProgressViewModel | null;
}
