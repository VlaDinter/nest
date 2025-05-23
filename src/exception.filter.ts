import { Request, Response } from 'express';
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IAPIErrorResult } from './interfaces/api-error-result.interface';
import { IFieldError } from './interfaces/field-error.interface';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (process.env.envorinment !== 'production') {
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
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR &&
      process.env.envorinment !== 'production'
    ) {
      response.status(status).json(exception);
    }

    if (status === HttpStatus.BAD_REQUEST) {
      const responseBody = exception.getResponse();
      const errorResponse: IAPIErrorResult = {
        errorsMessages: [],
      };

      responseBody['message']?.forEach((item: IFieldError): void => {
        errorResponse.errorsMessages?.push(item);
      });

      response.status(status).json(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
