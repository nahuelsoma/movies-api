import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaKnownExceptionsFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const getMessageByExceptionCode = (code: string, target?: unknown) => {
      switch (code) {
        case 'P2002':
          const hasManyTargets = Array.isArray(target) && target.length > 1;
          return target
            ? `${hasManyTargets ? 'These' : 'This'} ${
                hasManyTargets ? target.join(', ') : target
              } ${hasManyTargets ? 'are' : 'is'} already taken`
            : 'Unique field is already taken';
        default:
          return 'Request error';
      }
    };

    response.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      message: getMessageByExceptionCode(
        exception.code,
        exception.meta?.target,
      ),
      error: 'Conflict',
    });
  }
}

@Catch(PrismaClientValidationError)
export class PrismaValidationExceptionsFilter implements ExceptionFilter {
  catch(exception: PrismaClientValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionMessage = exception.message;

    let message: string;

    if (exceptionMessage.includes('Invalid value')) {
      message = exceptionMessage.substring(
        exceptionMessage.indexOf('Invalid value'),
        exceptionMessage.length,
      );
    }

    if (exceptionMessage.includes('Argument')) {
      message = exceptionMessage.substring(
        exceptionMessage.indexOf('Argument'),
        exceptionMessage.length,
      );
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'Bad Request',
    });
  }
}
