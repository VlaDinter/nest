import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseValuesPipe implements PipeTransform {
  constructor(private readonly values: string[]) {}

  transform(value: string): string | void {
    if (this.values.includes(value)) {
      return value;
    }
  }
}
