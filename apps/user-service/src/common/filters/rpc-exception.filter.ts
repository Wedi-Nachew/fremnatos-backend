import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(HttpException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, _host: ArgumentsHost): Observable<never> {
    const status = exception.getStatus();
    const response = exception.getResponse();

    return throwError(
      () =>
        new RpcException({
          statusCode: status,
          message: response,
        }),
    );
  }
}
