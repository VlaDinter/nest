import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IFieldError } from '../../../interfaces/field-error.interface';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { loginOrEmail, password } = request.body;
    const errors: IFieldError[] = [];

    if (!loginOrEmail || typeof loginOrEmail !== 'string') {
      errors.push({
        message: 'loginOrEmail has incorrect value',
        field: 'loginOrEmail',
      });
    }

    if (!password || typeof password !== 'string') {
      errors.push({
        message: 'password has incorrect value',
        field: 'password',
      });
    }

    if (errors.length) {
      throw new BadRequestException(errors);
    }

    return super.canActivate(context) as boolean;
  }
}
