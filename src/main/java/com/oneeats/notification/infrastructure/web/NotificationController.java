package com.oneeats.notification.infrastructure.web;

import com.oneeats.notification.application.command.CreateNotificationCommand;
import com.oneeats.notification.application.command.CreateNotificationCommandHandler;
import com.oneeats.notification.application.dto.NotificationDTO;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.UUID;

@Path("/api/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificationController {

    @Inject
    CreateNotificationCommandHandler createNotificationCommandHandler;

    @POST
    public Response createNotification(@Valid CreateNotificationCommand command) {
        NotificationDTO notification = createNotificationCommandHandler.handle(command);
        return Response.status(Response.Status.CREATED).entity(notification).build();
    }

    @GET
    @Path("/{id}")
    public Response getNotificationById(@PathParam("id") UUID id) {
        // TODO: Implement GetNotificationQuery and Handler
        return Response.ok().build();
    }
}