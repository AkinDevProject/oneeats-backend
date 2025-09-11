package com.oneeats.shared.exception;

import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class EntityNotFoundExceptionMapper implements ExceptionMapper<EntityNotFoundException> {
    
    @Override
    public Response toResponse(EntityNotFoundException exception) {
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ErrorResponse(
                "ENTITY_NOT_FOUND",
                exception.getMessage(),
                exception.getEntityType(),
                exception.getEntityId()
            ))
            .build();
    }
    
    public static class ErrorResponse {
        public final String error;
        public final String message;
        public final String entityType;
        public final Object entityId;
        
        public ErrorResponse(String error, String message, String entityType, Object entityId) {
            this.error = error;
            this.message = message;
            this.entityType = entityType;
            this.entityId = entityId;
        }
    }
}