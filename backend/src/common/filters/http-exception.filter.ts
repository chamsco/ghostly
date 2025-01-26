import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      message = response.message || exception.message;
      error = response.error || 'Error';
      details = response.details || null;
    } else if (exception instanceof QueryFailedError) {
      // Handle database errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      error = 'Database Error';
      
      // Add more specific error handling for unique constraint violations
      if ((exception as any).code === '23505') {
        message = 'A record with this value already exists';
        error = 'Duplicate Entry';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = exception.stack;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Send the error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }
} 