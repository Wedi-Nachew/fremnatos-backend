import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface RpcErrorPayload {
  statusCode?: number;
  status?: number | string;
  message?: string | object;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickStatus(value: unknown): number | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.statusCode === 'number') {
    return value.statusCode;
  }

  if (typeof value.status === 'number') {
    return value.status;
  }

  return undefined;
}

function pickMessage(value: unknown): string | object | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.message === 'string' || isRecord(value.message)) {
    return value.message;
  }

  return undefined;
}

function isGenericRpcMessage(value: string | object | undefined): boolean {
  return value === 'Rpc Exception';
}

function extractNestedRpcPayload(value: unknown): {
  status?: number;
  message?: string | object;
} {
  if (!isRecord(value)) {
    return {};
  }

  const directStatus = pickStatus(value);
  const directMessage = pickMessage(value);

  // Prefer concrete status-bearing payloads over generic wrapper messages.
  if (directStatus !== undefined) {
    return { status: directStatus, message: directMessage };
  }

  const searchTargets: unknown[] = [
    value.error,
    value.message,
    value.cause,
    value.response,
  ];

  for (const target of searchTargets) {
    const nested = extractNestedRpcPayload(target);
    if (nested.status !== undefined || nested.message !== undefined) {
      return nested;
    }
  }

  if (directMessage !== undefined && !isGenericRpcMessage(directMessage)) {
    return { message: directMessage };
  }

  return {};
}

function extractRpcError(exception: unknown): {
  status: number;
  message: string | object;
} {
  if (!isRecord(exception)) {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  const ex = exception as Record<string, unknown>;

  if (Array.isArray(ex.errors)) {
    const hasConnectionRefused = ex.errors.some(
      (err) => isRecord(err) && err.code === 'ECONNREFUSED',
    );

    if (hasConnectionRefused) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Dependent service is unavailable. Please try again shortly.',
      };
    }
  }

  if (ex.code === 'ECONNREFUSED') {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Dependent service is unavailable. Please try again shortly.',
    };
  }

  const extracted = extractNestedRpcPayload(ex as RpcErrorPayload);

  if (extracted.status !== undefined || extracted.message !== undefined) {
    return {
      status: extracted.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      message: extracted.message ?? 'Internal server error',
    };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else {
      const extracted = extractRpcError(exception);
      status = extracted.status;
      message = extracted.message;
    }

    this.logger.error(
      `[${request.method}] ${request.url} -> ${status} | ${JSON.stringify(message)} | Raw: ${exception instanceof Error ? exception.message : JSON.stringify(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'string' ? { message } : message),
    });
  }
}
