import { IsDefined, IsString } from 'class-validator';

export class AnswerInputModel {
  @IsString()
  @IsDefined()
  answer: string;
}
