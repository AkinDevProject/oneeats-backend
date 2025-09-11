package com.oneeats.menu.infrastructure.web;

import com.oneeats.menu.application.command.CreateMenuItemCommand;
import com.oneeats.menu.application.command.CreateMenuItemCommandHandler;
import com.oneeats.menu.application.command.UpdateMenuItemCommand;
import com.oneeats.menu.application.command.UpdateMenuItemCommandHandler;
import com.oneeats.menu.application.command.DeleteMenuItemCommand;
import com.oneeats.menu.application.command.DeleteMenuItemCommandHandler;
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
    public Response updateMenuItem(@PathParam("id") UUID id, @Valid UpdateMenuItemCommand command) {
        try {
            UpdateMenuItemCommand commandWithId = new UpdateMenuItemCommand(
                id,
                command.name(),
                command.description(),
                command.price(),
                command.category(),
                command.imageUrl(),
                command.preparationTimeMinutes(),
                command.isVegetarian(),
                command.isVegan(),
                command.isAvailable(),
                command.allergens()
            );
            
            MenuItemDTO menuItem = updateMenuItemCommandHandler.handle(commandWithId);
            return Response.ok(menuItem).build();
        } catch (EntityNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
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
}