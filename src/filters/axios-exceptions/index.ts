import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Response } from 'express';

@Catch(AxiosError)
export class AxiosExceptionsFilter implements ExceptionFilter {
  catch(exception: AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const expressResponse = ctx.getResponse<Response>();

    const { message, response } = exception;

    const firstLetterUpperCase = (word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1);

    const statusCode = response?.status || 500;
    const error =
      firstLetterUpperCase(
        HttpStatus[statusCode].replace(/_/g, ' ').toLocaleLowerCase(),
      ) || 'Internal Server Error';

    expressResponse.status(statusCode).json({
      statusCode,
      message,
      error,
    });
  }
}
