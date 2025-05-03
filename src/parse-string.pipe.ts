import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseStringPipe implements PipeTransform {
  transform(value: string): string | void {
    if (typeof value === 'string') {
      return value;
    }
  }
}
