import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  RpcExceptionFilter,
  Logger,
  HttpException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class AllExceptionsFilter implements RpcExceptionFilter<unknown> {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    const errorMessage =
      exception instanceof Error ? exception.message : JSON.stringify(exception);

    this.logger.error(
      `RpcException | Data: ${JSON.stringify(data)} | Error: ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (exception instanceof HttpException) {
      return throwError(
        () =>
          new RpcException({
            statusCode: exception.getStatus(),
            message: exception.getResponse(),
          }),
      );
    }

    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

    if (exception instanceof Error) {
      return throwError(
        () =>
          new RpcException({
            status: 'error',
            message: exception.message,
          }),
      );
    }

    return throwError(
      () =>
        new RpcException({
          status: 'error',
          message: errorMessage,
        }),
    );
  }
}
