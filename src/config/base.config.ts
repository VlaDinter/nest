import { validateSync, ValidationError } from 'class-validator';

export class BaseConfig {
  static getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
    return Object.values(enumObj);
  }

  protected getNumber(
    key: string,
    value: string,
    defaultValue?: number,
  ): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      if (defaultValue !== undefined) {
        return defaultValue;
      } else {
        throw new Error(
          `Invalid configuration for ${key}: can't parse to number`,
        );
      }
    }

    return parsedValue;
  }

  protected convertToBoolean(value: string): boolean | null {
    const trimmedValue = value?.trim();

    if (trimmedValue === 'true') return true;
    if (trimmedValue === '1') return true;
    if (trimmedValue === 'enabled') return true;
    if (trimmedValue === 'false') return false;
    if (trimmedValue === '0') return false;
    if (trimmedValue === 'disabled') return false;

    return null;
  }

  protected validateConfig<T extends object>(config: T): void {
    const errors = validateSync(config, { skipMissingProperties: false });

    if (errors.length) {
      const sortedMessages = errors
        .map((error: ValidationError): string =>
          Object.values(error.constraints || {}).join(', '),
        )
        .join('; ');

      throw new Error('Validation failed: ' + sortedMessages);
    }
  }
}
