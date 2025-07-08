package com.oneeats.menu.adapter.web;

import com.oneeats.menu.api.cqrs.command.CreateMenuItemCommand;
import com.oneeats.menu.api.cqrs.command.UpdateMenuItemCommand;
import com.oneeats.menu.api.model.MenuItemDto;
import com.oneeats.menu.internal.application.CreateMenuItemUseCase;
import com.oneeats.menu.internal.application.UpdateMenuItemUseCase;
import com.oneeats.menu.internal.application.GetMenuItemUseCase;
import com.oneeats.menu.internal.application.GetAllMenuItemsUseCase;
import com.oneeats.menu.internal.application.DeleteMenuItemUseCase;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Path("/menu-items")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MenuResource {
    @Inject
    CreateMenuItemUseCase createMenuItemUseCase;
    @Inject
    UpdateMenuItemUseCase updateMenuItemUseCase;
    @Inject
    GetMenuItemUseCase getMenuItemUseCase;
    @Inject
    GetAllMenuItemsUseCase getAllMenuItemsUseCase;
    @Inject
    DeleteMenuItemUseCase deleteMenuItemUseCase;

    @POST
    public Response createMenuItem(CreateMenuItemCommand command) {
        UUID id = createMenuItemUseCase.handle(command);
        return Response.status(Response.Status.CREATED).entity(id).build();
    }

    @PUT
    public Response updateMenuItem(UpdateMenuItemCommand command) {
        boolean updated = updateMenuItemUseCase.handle(command);
        if (updated) {
            return Response.ok().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getMenuItem(@PathParam("id") UUID id) {
        Optional<MenuItemDto> dto = getMenuItemUseCase.handle(id);
        return dto.map(Response::ok)
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND))
                .build();
    }

    @GET
    public List<MenuItemDto> getAllMenuItems() {
        return getAllMenuItemsUseCase.handle();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteMenuItem(@PathParam("id") UUID id) {
        boolean deleted = deleteMenuItemUseCase.handle(id);
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
}
