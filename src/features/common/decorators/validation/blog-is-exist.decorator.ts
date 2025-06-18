import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsService } from '../../../modules/blogs/application/blogs.service';

@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsService: BlogsService) {}

  async validate(value: string): Promise<boolean> {
    const blogIsExist = await this.blogsService.getBlog(value);

    if (!blogIsExist) {
      return false;
    }

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `blog ${validationArguments?.value} already exist`;
  }
}

export function BlogIsExit(
  property?: string,
  validationOptions?: ValidationOptions,
): (object: Object, propertyName: string) => void {
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      constraints: [property],
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogIsExistConstraint,
    });
  };
}
