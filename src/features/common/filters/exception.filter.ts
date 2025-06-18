import {
  Catch,
  HttpStatus,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BadFieldsException } from '../exceptions/bad-fields.exception';
import { IFieldError } from '../../base/interfaces/field-error.interface';
import { IEnvironments } from '../../base/interfaces/environments.interface';
import { IAPIErrorResult } from '../../base/interfaces/api-error-result.interface';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (process.env.NODE_ENV !== IEnvironments.PRODUCTION) {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('some error occurred');
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const responseBody = this.buildResponseBody(exception, request.url);

    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR &&
      process.env.NODE_ENV !== IEnvironments.PRODUCTION
    ) {
      response.status(status).json(exception);
    }

    response.status(status).json(responseBody);
  }

  private buildResponseBody(exception: HttpException, requestUrl: string) {
    const responseBody = exception.getResponse();
    const isProduction = process.env.NODE_ENV === IEnvironments.PRODUCTION;

    if (isProduction) {
      return {
        timestamp: new Date().toISOString(),
        path: null,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Some error occurred',
        extensions: [],
      };
    }

    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      statusCode: responseBody['code'],
      message: responseBody['message'] || 'Unknown exception occurred.',
      extensions: responseBody['extensions'],
    };
  }
}

@Catch(BadFieldsException)
export class BadFieldsExceptionFilter implements ExceptionFilter {
  catch(exception: BadFieldsException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.code;
    const responseBody = exception.extensions;
    const errorResponse: IAPIErrorResult = {
      errorsMessages: [],
    };

    responseBody.forEach((item: IFieldError): void => {
      errorResponse.errorsMessages?.push(item);
    });

    response.status(status).json(errorResponse);
  }
}
