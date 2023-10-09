import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaKnownExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const code = exception.code;
    const target = exception.meta?.target;
    const message = exception.message;

    const getMessageByExceptionCode = (
      code: string,
      target: unknown,
      message: string,
    ) => {
      switch (code) {
        case 'P2002':
          const hasManyTargets = Array.isArray(target) && target.length > 1;

          return target
            ? `${hasManyTargets ? 'These' : 'This'} ${
                hasManyTargets ? target.join(', ') : target
              } ${hasManyTargets ? 'are' : 'is'} already taken`
            : 'Unique field is already taken';
        case 'P2025':
          const referenceString =
            'An operation failed because it depends on one or more records that were required but not found. ';

          const prismaMessage = message.substring(
            message.indexOf(referenceString),
            message.length,
          );

          return prismaMessage.replace(referenceString, '');
        default:
          return 'Request error';
      }
    };

    const errorMessage = getMessageByExceptionCode(code, target, message);

    this.logger.error(
      errorMessage,
      exception.stack,
      'PrismaClientKnownRequestError',
    );

    response.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      message: errorMessage,
      error: 'Conflict',
    });
  }
}

@Catch(PrismaClientValidationError)
export class PrismaValidationExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

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

    this.logger.error(message, exception.stack, 'PrismaClientValidationError');

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'Bad Request',
    });
  }
}
