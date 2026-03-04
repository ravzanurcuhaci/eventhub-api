import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {

        //context i http ye çevirme 
        //ArgumentsHost generic bir yapıdır Biz HTTP uygulaması olduğumuz için:ArgumentsHost → HTTP context'e dönüştürdük
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        //varsayılan değerler
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Internal server error';
        let code = 'INTERNAL_SERVER_ERROR';

        //Hata Türlerine Göre Ayrım

        if (exception instanceof HttpException) {
            //nestn verdiği http statusu alıyoruz
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || exceptionResponse;
            code = 'HTTP_EXCEPTION';
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            code = exception.code;
            switch (exception.code) {
                case 'P2002':
                    status = HttpStatus.CONFLICT;
                    message = 'Unique constraint failed, record already exists.';
                    break;
                case 'P2025':
                    status = HttpStatus.NOT_FOUND;
                    message = 'Record not found.';
                    break;
                case 'P2003':
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Foreign key constraint failed.';
                    break;
                default:
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Database request error.';
                    break;
            }
        } else if (exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST;
            code = 'PRISMA_VALIDATION_ERROR';
            message = 'Database validation error.';
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        const errorResponse = {
            success: false,
            statusCode: status,
            error: {
                code,
                message,
            },
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `${request.method} ${request.url} -> Status: ${status} Error: ${exception instanceof Error ? exception.stack : exception}`,
            );
        } else {
            this.logger.warn(
                `${request.method} ${request.url} -> Status: ${status} Message: ${JSON.stringify(message)}`,
            );
        }

        response.status(status).json(errorResponse);
    }
}