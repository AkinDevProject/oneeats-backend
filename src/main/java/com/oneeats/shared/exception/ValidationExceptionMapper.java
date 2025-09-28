package com.oneeats.shared.exception;

import com.oneeats.shared.domain.exception.ValidationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ValidationException> {

    @Override
    public Response toResponse(ValidationException exception) {
        return Response.status(Response.Status.BAD_REQUEST)
            .entity(new ErrorResponse(
                "VALIDATION_ERROR",
                exception.getMessage(),
                "validation",
                null
            ))
            .build();
    }

    public static class ErrorResponse {
        public final String error;
        public final String message;
        public final String type;
        public final Object details;

        public ErrorResponse(String error, String message, String type, Object details) {
            this.error = error;
            this.message = message;
            this.type = type;
            this.details = details;
        }
    }
}