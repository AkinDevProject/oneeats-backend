package com.oneeats.menu.infrastructure.web;

import com.oneeats.menu.application.command.CreateMenuItemCommand;
import com.oneeats.menu.application.command.CreateMenuItemCommandHandler;
import com.oneeats.menu.application.command.UpdateMenuItemCommand;
import com.oneeats.menu.application.command.UpdateMenuItemRequest;
import com.oneeats.menu.application.command.UpdateMenuItemCommandHandler;
import com.oneeats.menu.application.command.DeleteMenuItemCommand;
import com.oneeats.menu.application.command.DeleteMenuItemCommandHandler;
import com.oneeats.menu.application.command.UploadMenuItemImageCommand;
import com.oneeats.menu.application.command.UploadMenuItemImageCommandHandler;
import com.oneeats.menu.application.command.DeleteMenuItemImageCommand;
import com.oneeats.menu.application.command.DeleteMenuItemImageCommandHandler;
import com.oneeats.menu.application.query.GetMenuItemQuery;
import com.oneeats.menu.application.query.GetMenuItemQueryHandler;
import com.oneeats.menu.application.query.GetRestaurantMenuQuery;
import com.oneeats.menu.application.query.GetRestaurantMenuQueryHandler;
import com.oneeats.menu.application.query.SearchMenuItemsQuery;
import com.oneeats.menu.application.query.SearchMenuItemsQueryHandler;
import com.oneeats.menu.application.dto.MenuItemDTO;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Path("/api/menu-items")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MenuController {
    
    @Inject
    CreateMenuItemCommandHandler createMenuItemCommandHandler;
    
    @Inject
    UpdateMenuItemCommandHandler updateMenuItemCommandHandler;
    
    @Inject
    DeleteMenuItemCommandHandler deleteMenuItemCommandHandler;
    
    @Inject
    GetMenuItemQueryHandler getMenuItemQueryHandler;
    
    @Inject
    GetRestaurantMenuQueryHandler getRestaurantMenuQueryHandler;
    
    @Inject
    SearchMenuItemsQueryHandler searchMenuItemsQueryHandler;

    @Inject
    UploadMenuItemImageCommandHandler uploadMenuItemImageCommandHandler;

    @Inject
    DeleteMenuItemImageCommandHandler deleteMenuItemImageCommandHandler;
    
    @POST
    public Response createMenuItem(@Valid CreateMenuItemCommand command) {
        try {
            MenuItemDTO menuItem = createMenuItemCommandHandler.handle(command);
            return Response.status(Response.Status.CREATED).entity(menuItem).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error creating menu item: " + e.getMessage())
                .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    public Response updateMenuItem(@PathParam("id") UUID id, @Valid UpdateMenuItemRequest request) {
        try {
            UpdateMenuItemCommand command = request.toCommand(id);
            MenuItemDTO menuItem = updateMenuItemCommandHandler.handle(command);
            return Response.ok(menuItem).build();
        } catch (EntityNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        } catch (jakarta.validation.ConstraintViolationException e) {
            // Log détaillé des violations de contraintes
            String violations = e.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(java.util.stream.Collectors.joining(", "));
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Constraint violations: " + violations)
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error updating menu item: " + e.getMessage())
                .build();
        }
    }
    
    @GET
    @Path("/{id}")
    public Response getMenuItem(@PathParam("id") UUID id) {
        try {
            GetMenuItemQuery query = new GetMenuItemQuery(id);
            MenuItemDTO menuItem = getMenuItemQueryHandler.handle(query);
            return Response.ok(menuItem).build();
        } catch (EntityNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    public Response deleteMenuItem(@PathParam("id") UUID id) {
        try {
            DeleteMenuItemCommand command = new DeleteMenuItemCommand(id);
            deleteMenuItemCommandHandler.handle(command);
            return Response.noContent().build();
        } catch (EntityNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        }
    }
    
    @GET
    @Path("/restaurant/{restaurantId}")
    public Response getRestaurantMenu(
            @PathParam("restaurantId") UUID restaurantId,
            @QueryParam("onlyAvailable") @DefaultValue("false") boolean onlyAvailable) {
        try {
            GetRestaurantMenuQuery query = new GetRestaurantMenuQuery(restaurantId, null, onlyAvailable, null, null, null, null);
            List<MenuItemDTO> menuItems = getRestaurantMenuQueryHandler.handle(query);
            return Response.ok(menuItems).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error fetching restaurant menu: " + e.getMessage())
                .build();
        }
    }
    
    @GET
    @Path("/search")
    public Response searchMenuItems(
            @QueryParam("q") String searchTerm,
            @QueryParam("restaurantId") UUID restaurantId) {
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Search term is required")
                .build();
        }
        
        try {
            SearchMenuItemsQuery query = new SearchMenuItemsQuery(restaurantId, searchTerm, null, null);
            List<MenuItemDTO> menuItems = searchMenuItemsQueryHandler.handle(query);
            return Response.ok(menuItems).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error searching menu items: " + e.getMessage())
                .build();
        }
    }

    @POST
    @Path("/{id}/image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadMenuItemImage(
        @PathParam("id") UUID id,
        @FormParam("file") InputStream fileStream,
        @FormParam("filename") String filename
    ) {
        try {
            if (fileStream == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("File is required")
                    .build();
            }
            if (filename == null || filename.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Filename is required")
                    .build();
            }

            // Read file into byte array for size validation
            byte[] fileBytes = fileStream.readAllBytes();
            if (fileBytes.length == 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Empty file")
                    .build();
            }

            ByteArrayInputStream byteStream = new ByteArrayInputStream(fileBytes);
            UploadMenuItemImageCommand command = new UploadMenuItemImageCommand(
                id,
                byteStream,
                filename,
                fileBytes.length
            );
            MenuItemDTO menuItem = uploadMenuItemImageCommandHandler.handle(command);
            return Response.ok(menuItem).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(e.getMessage())
                .build();
        } catch (IOException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Failed to read uploaded file")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Upload failed: " + e.getMessage())
                .build();
        }
    }

    @DELETE
    @Path("/{id}/image")
    public Response deleteMenuItemImage(@PathParam("id") UUID id) {
        try {
            DeleteMenuItemImageCommand command = new DeleteMenuItemImageCommand(id);
            MenuItemDTO menuItem = deleteMenuItemImageCommandHandler.handle(command);
            return Response.ok(menuItem).build();
        } catch (EntityNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Failed to delete image: " + e.getMessage())
                .build();
        }
    }
}