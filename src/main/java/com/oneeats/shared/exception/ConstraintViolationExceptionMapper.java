package com.oneeats.shared.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.List;
import java.util.stream.Collectors;

@Provider
public class ConstraintViolationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Override
    public Response toResponse(ConstraintViolationException exception) {
        List<ValidationError> violations = exception.getConstraintViolations()
            .stream()
            .map(this::mapConstraintViolation)
            .collect(Collectors.toList());

        return Response.status(Response.Status.BAD_REQUEST)
            .entity(new ErrorResponse(
                "CONSTRAINT_VIOLATION",
                "Validation failed",
                "validation",
                violations
            ))
            .build();
    }

    private ValidationError mapConstraintViolation(ConstraintViolation<?> violation) {
        String propertyPath = violation.getPropertyPath().toString();
        String message = violation.getMessage();
        Object invalidValue = violation.getInvalidValue();

        return new ValidationError(propertyPath, message, invalidValue);
    }

    public static class ErrorResponse {
        public final String error;
        public final String message;
        public final String type;
        public final Object violations;

        public ErrorResponse(String error, String message, String type, Object violations) {
            this.error = error;
            this.message = message;
            this.type = type;
            this.violations = violations;
        }
    }

    public static class ValidationError {
        public final String field;
        public final String message;
        public final Object invalidValue;

        public ValidationError(String field, String message, Object invalidValue) {
            this.field = field;
            this.message = message;
            this.invalidValue = invalidValue;
        }
    }
}