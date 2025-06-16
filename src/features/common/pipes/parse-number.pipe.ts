import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseNumberPipe implements PipeTransform {
  transform(value: number): number | void {
    if (typeof value === 'number' && value > 0) {
      return value;
    }
  }
}
