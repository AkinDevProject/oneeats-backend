package com.oneeats.menu.infrastructure;

import com.oneeats.menu.api.CreateMenuItemRequest;
import com.oneeats.menu.api.MenuItemDto;
import com.oneeats.menu.domain.MenuItem;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour les items de menu
 */
@Path("/api/menu-items")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MenuResource {

    @Inject
    MenuItemRepository menuItemRepository;
    
    @Inject
    MenuItemMapper menuItemMapper;
    
    /**
     * Obtenir tous les items de menu d'un restaurant
     */
    @GET
    @Path("/restaurant/{restaurantId}")
    public List<MenuItemDto> getMenuItemsByRestaurant(
            @PathParam("restaurantId") UUID restaurantId,
            @QueryParam("category") String category,
            @QueryParam("available") Boolean available,
            @QueryParam("vegetarian") Boolean vegetarian,
            @QueryParam("vegan") Boolean vegan,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("50") int size) {
        
        List<MenuItem> menuItems;
        
        if (category != null || available != null || vegetarian != null || vegan != null) {
            menuItems = menuItemRepository.findWithFilters(
                restaurantId, category, vegetarian, vegan, available, page, size
            );
        } else {
            menuItems = menuItemRepository.findByRestaurantId(restaurantId);
        }
        
        return menuItems.stream()
                .map(menuItemMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir les items disponibles d'un restaurant
     */
    @GET
    @Path("/restaurant/{restaurantId}/available")
    public List<MenuItemDto> getAvailableMenuItems(@PathParam("restaurantId") UUID restaurantId) {
        return menuItemRepository.findAvailableByRestaurantId(restaurantId)
                .stream()
                .map(menuItemMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir les catégories d'un restaurant
     */
    @GET
    @Path("/restaurant/{restaurantId}/categories")
    public List<String> getMenuCategories(@PathParam("restaurantId") UUID restaurantId) {
        return menuItemRepository.findCategoriesByRestaurantId(restaurantId);
    }
    
    /**
     * Obtenir les items par catégorie
     */
    @GET
    @Path("/restaurant/{restaurantId}/category/{category}")
    public List<MenuItemDto> getMenuItemsByCategory(
            @PathParam("restaurantId") UUID restaurantId,
            @PathParam("category") String category) {
        return menuItemRepository.findByRestaurantIdAndCategory(restaurantId, category)
                .stream()
                .map(menuItemMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir un item de menu par ID
     */
    @GET
    @Path("/{id}")
    public MenuItemDto getMenuItem(@PathParam("id") UUID id) {
        MenuItem menuItem = menuItemRepository.findByIdRequired(id);
        return menuItemMapper.toDto(menuItem);
    }
    
    /**
     * Créer un nouvel item de menu
     */
    @POST
    @Transactional
    public Response createMenuItem(@Valid CreateMenuItemRequest request) {
        MenuItem menuItem = menuItemMapper.toEntity(request);
        menuItemRepository.persist(menuItem);
        
        MenuItemDto dto = menuItemMapper.toDto(menuItem);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }
    
    /**
     * Mettre à jour un item de menu
     */
    @PUT
    @Path("/{id}")
    @Transactional
    public MenuItemDto updateMenuItem(@PathParam("id") UUID id, @Valid CreateMenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findByIdRequired(id);
        menuItemMapper.updateEntity(menuItem, request);
        menuItemRepository.persist(menuItem);
        
        return menuItemMapper.toDto(menuItem);
    }
    
    /**
     * Supprimer un item de menu
     */
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteMenuItem(@PathParam("id") UUID id) {
        boolean deleted = menuItemRepository.deleteByIdSafe(id);
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
    
    /**
     * Changer la disponibilité d'un item
     */
    @PUT
    @Path("/{id}/availability")
    @Transactional
    public MenuItemDto toggleAvailability(@PathParam("id") UUID id, AvailabilityRequest request) {
        MenuItem menuItem = menuItemRepository.findByIdRequired(id);
        
        if (request.available()) {
            menuItem.makeAvailable();
        } else {
            menuItem.makeUnavailable();
        }
        
        menuItemRepository.persist(menuItem);
        return menuItemMapper.toDto(menuItem);
    }
    
    /**
     * Rechercher dans les items de menu d'un restaurant
     */
    @GET
    @Path("/restaurant/{restaurantId}/search")
    public List<MenuItemDto> searchInRestaurant(
            @PathParam("restaurantId") UUID restaurantId,
            @QueryParam("q") String query) {
        return menuItemRepository.searchInRestaurant(restaurantId, query)
                .stream()
                .map(menuItemMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir les items végétariens
     */
    @GET
    @Path("/restaurant/{restaurantId}/vegetarian")
    public List<MenuItemDto> getVegetarianItems(@PathParam("restaurantId") UUID restaurantId) {
        return menuItemRepository.findVegetarianByRestaurantId(restaurantId)
                .stream()
                .map(menuItemMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir les items végétaliens
     */
    @GET
    @Path("/restaurant/{restaurantId}/vegan")
    public List<MenuItemDto> getVeganItems(@PathParam("restaurantId") UUID restaurantId) {
        return menuItemRepository.findVeganByRestaurantId(restaurantId)
                .stream()
                .map(menuItemMapper::toDto)
                .toList();
    }
    
    /**
     * Recherche globale dans les items de menu
     */
    @GET
    @Path("/search")
    public List<MenuItemDto> searchMenuItems(@QueryParam("q") String query) {
        return menuItemRepository.search(query)
                .stream()
                .map(menuItemMapper::toDto)
                .toList();
    }
    
    /**
     * Record pour la requête de changement de disponibilité
     */
    public record AvailabilityRequest(boolean available) {}
}