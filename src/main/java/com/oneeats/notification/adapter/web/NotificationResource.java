package com.oneeats.notification.adapter.web;

import com.oneeats.notification.api.cqrs.command.SendNotificationCommand;
import com.oneeats.notification.api.cqrs.command.MarkNotificationAsReadCommand;
import com.oneeats.notification.api.model.NotificationDto;
import com.oneeats.notification.internal.application.SendNotificationUseCase;
import com.oneeats.notification.internal.application.MarkNotificationAsReadUseCase;
import com.oneeats.notification.internal.application.GetNotificationUseCase;
import com.oneeats.notification.internal.application.GetAllNotificationsUseCase;
import com.oneeats.notification.internal.application.DeleteNotificationUseCase;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Path("/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificationResource {
    @Inject
    SendNotificationUseCase sendNotificationUseCase;
    @Inject
    MarkNotificationAsReadUseCase markNotificationAsReadUseCase;
    @Inject
    GetNotificationUseCase getNotificationUseCase;
    @Inject
    GetAllNotificationsUseCase getAllNotificationsUseCase;
    @Inject
    DeleteNotificationUseCase deleteNotificationUseCase;

    @POST
    public Response sendNotification(SendNotificationCommand command) {
        UUID id = sendNotificationUseCase.handle(command);
        return Response.status(Response.Status.CREATED).entity(id).build();
    }

    @PATCH
    @Path("/read")
    public Response markAsRead(MarkNotificationAsReadCommand command) {
        markNotificationAsReadUseCase.handle(command);
        return Response.ok().build();
    }

    @GET
    @Path("/{id}")
    public Response getNotification(@PathParam("id") UUID id) {
        Optional<NotificationDto> dto = getNotificationUseCase.handle(id);
        return dto.map(Response::ok)
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND))
                .build();
    }

    @GET
    public List<NotificationDto> getAllNotifications(@QueryParam("destinataireId") UUID destinataireId) {
        if (destinataireId != null) {
            return getAllNotificationsUseCase.handle(destinataireId);
        } else {
            return getAllNotificationsUseCase.handleAll();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteNotification(@PathParam("id") UUID id) {
        boolean deleted = deleteNotificationUseCase.handle(id);
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
}
