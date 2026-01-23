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
import com.oneeats.security.Roles;
import com.oneeats.security.application.AuthService;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

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

    private static final Logger LOG = Logger.getLogger(MenuController.class);

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    AuthService authService;

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
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response createMenuItem(@Valid CreateMenuItemCommand command) {
        // Verifier l'acces au restaurant (sauf admin)
        if (!authService.hasRole(Roles.ADMIN)) {
            authService.requireRestaurantAccess(command.restaurantId());
        }

        // Debug logs pour diagnostic auth
        LOG.infof("=== POST /api/menu-items called ===");
        LOG.infof("User authenticated: %s", !securityIdentity.isAnonymous());
        LOG.infof("User principal: %s", securityIdentity.getPrincipal() != null ? securityIdentity.getPrincipal().getName() : "null");
        LOG.infof("User roles: %s", securityIdentity.getRoles());
        LOG.infof("Command received: restaurantId=%s, name=%s",
            command != null ? command.restaurantId() : "null",
            command != null ? command.name() : "null");

        try {
            MenuItemDTO menuItem = createMenuItemCommandHandler.handle(command);
            LOG.infof("MenuItem created successfully: %s", menuItem.id());
            return Response.status(Response.Status.CREATED).entity(menuItem).build();
        } catch (Exception e) {
            LOG.errorf("Error creating menu item: %s", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error creating menu item: " + e.getMessage())
                .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response updateMenuItem(@PathParam("id") UUID id, @Valid UpdateMenuItemRequest request) {
        try {
            // Recuperer le menu item pour verifier l'acces au restaurant
            if (!authService.hasRole(Roles.ADMIN)) {
                GetMenuItemQuery query = new GetMenuItemQuery(id);
                MenuItemDTO existingItem = getMenuItemQueryHandler.handle(query);
                authService.requireRestaurantAccess(existingItem.restaurantId());
            }

            UpdateMenuItemCommand command = request.toCommand(id);
            MenuItemDTO menuItem = updateMenuItemCommandHandler.handle(command);
            return Response.ok(menuItem).build();
        } catch (EntityNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        } catch (ForbiddenException e) {
            return Response.status(Response.Status.FORBIDDEN)
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
    @PermitAll
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
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response deleteMenuItem(@PathParam("id") UUID id) {
        try {
            // Recuperer le menu item pour verifier l'acces au restaurant
            if (!authService.hasRole(Roles.ADMIN)) {
                GetMenuItemQuery query = new GetMenuItemQuery(id);
                MenuItemDTO existingItem = getMenuItemQueryHandler.handle(query);
                authService.requireRestaurantAccess(existingItem.restaurantId());
            }

            DeleteMenuItemCommand command = new DeleteMenuItemCommand(id);
            deleteMenuItemCommandHandler.handle(command);
            return Response.noContent().build();
        } catch (EntityNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        } catch (ForbiddenException e) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(e.getMessage())
                .build();
        }
    }
    
    @GET
    @Path("/restaurant/{restaurantId}")
    @PermitAll
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
    @PermitAll
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
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response uploadMenuItemImage(
        @PathParam("id") UUID id,
        @FormParam("file") InputStream fileStream,
        @FormParam("filename") String filename
    ) {
        // Verifier l'acces au restaurant (sauf admin)
        if (!authService.hasRole(Roles.ADMIN)) {
            try {
                GetMenuItemQuery query = new GetMenuItemQuery(id);
                MenuItemDTO existingItem = getMenuItemQueryHandler.handle(query);
                authService.requireRestaurantAccess(existingItem.restaurantId());
            } catch (EntityNotFoundException e) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
            }
        }

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
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response deleteMenuItemImage(@PathParam("id") UUID id) {
        // Verifier l'acces au restaurant (sauf admin)
        if (!authService.hasRole(Roles.ADMIN)) {
            try {
                GetMenuItemQuery query = new GetMenuItemQuery(id);
                MenuItemDTO existingItem = getMenuItemQueryHandler.handle(query);
                authService.requireRestaurantAccess(existingItem.restaurantId());
            } catch (EntityNotFoundException e) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
            }
        }

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