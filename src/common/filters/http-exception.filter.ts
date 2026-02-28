import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        // Default values
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let responseBody: any = {
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Unexpected error occurred',
                details: null,
            },
        };

        // HttpException (Nest'in fırlattıkları)
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exResponse = exception.getResponse();

            // Eğer bizim custom body'miz varsa (validation'da yaptığımız gibi) onu aynen geç
            if (typeof exResponse === 'object' && exResponse !== null) {
                // BadRequestException(formatValidationErrors...) burada zaten success:false...
                // Ama yine de güvenli olsun diye kontrol ediyoruz
                if ((exResponse as any).success === false) {
                    responseBody = exResponse;
                } else {
                    responseBody = {
                        success: false,
                        error: {
                            code: HttpStatus[status] ?? 'HTTP_ERROR',
                            message: (exResponse as any).message ?? exception.message,
                            details: (exResponse as any),
                        },
                    };
                }
            } else {
                responseBody = {
                    success: false,
                    error: {
                        code: HttpStatus[status] ?? 'HTTP_ERROR',
                        message: String(exResponse),
                        details: null,
                    },
                };
            }
        }

        // Prisma errors (basit mapping)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyEx = exception as any;

        if (anyEx?.code === 'P2002') {
            status = HttpStatus.CONFLICT;
            responseBody = {
                success: false,
                error: {
                    code: 'UNIQUE_CONSTRAINT',
                    message: 'This value already exists (unique constraint).',
                    details: anyEx?.meta ?? null,
                },
            };
        }

        if (anyEx?.code === 'P2025') {
            status = HttpStatus.NOT_FOUND;
            responseBody = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Record not found.',
                    details: anyEx?.meta ?? null,
                },
            };
        }

        // Basit log: production değil, öğrenme seviyesinde "yeterli" log
        this.logger.error(
            `${req.method} ${req.originalUrl} -> ${status}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        res.status(status).json({
            ...responseBody,
            // debug için (istersen kaldırabilirsin)
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
        });
    }
}