import { Injectable } from '@nestjs/common';
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

@Injectable()
export class PluralNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  public tableName(className: string, customName: string): string {
    return customName ? customName : `${className}s`;
  }
}
