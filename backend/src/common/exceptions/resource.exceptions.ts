import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceDeploymentException extends HttpException {
  constructor(message: string = 'Failed to deploy resource', details?: any) {
    super(
      {
        message,
        error: 'Resource Deployment Error',
        details,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resourceId: string) {
    super(
      {
        message: `Resource with ID ${resourceId} not found`,
        error: 'Resource Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ResourceAccessDeniedException extends HttpException {
  constructor(message: string = 'You do not have permission to access this resource') {
    super(
      {
        message,
        error: 'Access Denied',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class InvalidResourceConfigException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        error: 'Invalid Resource Configuration',
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ResourceOperationException extends HttpException {
  constructor(operation: string, message: string, details?: any) {
    super(
      {
        message,
        error: `Resource ${operation} Error`,
        details,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
} 