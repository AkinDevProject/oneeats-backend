package com.oneeats.shared.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.logging.Level;
import java.util.logging.Logger;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {

    private static final Logger LOGGER = Logger.getLogger(GlobalExceptionMapper.class.getName());

    @Override
    public Response toResponse(Exception exception) {
        // Don't handle WebApplicationExceptions (they have their own handling)
        if (exception instanceof WebApplicationException) {
            return ((WebApplicationException) exception).getResponse();
        }

        // Log the unexpected exception
        LOGGER.log(Level.SEVERE, "Unhandled exception occurred", exception);

        // Return a generic error response for security reasons
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity(new ErrorResponse(
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred. Please try again later.",
                "server_error",
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