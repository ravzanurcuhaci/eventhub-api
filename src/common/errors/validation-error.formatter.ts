import { ValidationError } from 'class-validator';
//tek tip hata dönmek için main.ts de exceptionFactory kısmında veriyoruz
function flattenErrors(errors: ValidationError[], parentPath = '') {
    const result: { field: string; messages: string[] }[] = [];

    for (const err of errors) {
        const fieldPath = parentPath ? `${parentPath}.${err.property}` : err.property;

        const constraintsMessages = err.constraints
            ? Object.values(err.constraints)
            : [];

        if (constraintsMessages.length) {
            result.push({ field: fieldPath, messages: constraintsMessages });
        }

        if (err.children && err.children.length) {
            result.push(...flattenErrors(err.children, fieldPath));
        }
    }

    return result;
}

export function formatValidationErrors(errors: ValidationError[]) {
    return {
        success: false,
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: flattenErrors(errors),
        },
    };
}