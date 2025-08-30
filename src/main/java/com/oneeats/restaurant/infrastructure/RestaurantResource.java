package com.oneeats.restaurant.infrastructure;

import com.oneeats.restaurant.api.CreateRestaurantRequest;
import com.oneeats.restaurant.api.RestaurantDto;
import com.oneeats.restaurant.api.UpdateRestaurantRequest;
import com.oneeats.restaurant.domain.Restaurant;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour les restaurants
 */
@Path("/api/restaurants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RestaurantResource {

    @Inject
    RestaurantRepository restaurantRepository;
    
    @Inject
    RestaurantMapper restaurantMapper;
    
    /**
     * Obtenir tous les restaurants
     */
    @GET
    public List<RestaurantDto> getAllRestaurants(
            @QueryParam("cuisineType") String cuisineType,
            @QueryParam("isOpen") Boolean isOpen,
            @QueryParam("isActive") Boolean isActive,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        
        List<Restaurant> restaurants;
        
        if (cuisineType != null || isOpen != null || isActive != null) {
            restaurants = restaurantRepository.findWithFilters(cuisineType, isOpen, isActive, page, size);
        } else {
            restaurants = restaurantRepository.findWithPagination(page, size, null);
        }
        
        return restaurants.stream()
                .map(restaurantMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir les restaurants actifs
     */
    @GET
    @Path("/active")
    public List<RestaurantDto> getActiveRestaurants() {
        return restaurantRepository.findActiveRestaurants()
                .stream()
                .map(restaurantMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir un restaurant par ID
     */
    @GET
    @Path("/{id}")
    public RestaurantDto getRestaurant(@PathParam("id") UUID id) {
        Restaurant restaurant = restaurantRepository.findByIdRequired(id);
        return restaurantMapper.toDto(restaurant);
    }
    
    /**
     * Créer un nouveau restaurant
     */
    @POST
    @Transactional
    public Response createRestaurant(@Valid CreateRestaurantRequest request) {
        // Vérifier si l'email existe déjà
        if (restaurantRepository.existsByEmail(request.email())) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"message\": \"Un restaurant avec cet email existe déjà\"}")
                    .build();
        }
        
        Restaurant restaurant = restaurantMapper.toEntity(request);
        restaurantRepository.persist(restaurant);
        
        RestaurantDto dto = restaurantMapper.toDto(restaurant);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }
    
    /**
     * Mettre à jour un restaurant
     */
    @PUT
    @Path("/{id}")
    @Transactional
    public RestaurantDto updateRestaurant(@PathParam("id") UUID id, @Valid UpdateRestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findByIdRequired(id);
        
        // Vérifier si le nouvel email n'est pas déjà utilisé par un autre restaurant
        if (!restaurant.getEmail().equals(request.email()) && 
            restaurantRepository.existsByEmail(request.email())) {
            throw new WebApplicationException("Un restaurant avec cet email existe déjà", 
                                            Response.Status.CONFLICT);
        }
        
        restaurantMapper.updateEntity(restaurant, request);
        restaurantRepository.persist(restaurant);
        
        return restaurantMapper.toDto(restaurant);
    }
    
    /**
     * Supprimer un restaurant
     */
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteRestaurant(@PathParam("id") UUID id) {
        boolean deleted = restaurantRepository.deleteByIdSafe(id);
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
    
    /**
     * Ouvrir/fermer un restaurant
     */
    @PUT
    @Path("/{id}/toggle-open")
    @Transactional
    public RestaurantDto toggleOpen(@PathParam("id") UUID id) {
        Restaurant restaurant = restaurantRepository.findByIdRequired(id);
        
        if (restaurant.getIsOpen()) {
            restaurant.closeRestaurant();
        } else {
            restaurant.openRestaurant();
        }
        
        restaurantRepository.persist(restaurant);
        return restaurantMapper.toDto(restaurant);
    }
    
    /**
     * Activer/désactiver un restaurant
     */
    @PUT
    @Path("/{id}/toggle-active")
    @Transactional
    public RestaurantDto toggleActive(@PathParam("id") UUID id) {
        Restaurant restaurant = restaurantRepository.findByIdRequired(id);
        
        if (restaurant.getIsActive()) {
            restaurant.deactivate();
        } else {
            restaurant.activate();
        }
        
        restaurantRepository.persist(restaurant);
        return restaurantMapper.toDto(restaurant);
    }
    
    /**
     * Rechercher des restaurants
     */
    @GET
    @Path("/search")
    public List<RestaurantDto> searchRestaurants(@QueryParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllRestaurants(null, null, null, 0, 20);
        }
        
        return restaurantRepository.search(query)
                .stream()
                .map(restaurantMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir les restaurants par type de cuisine
     */
    @GET
    @Path("/by-cuisine/{cuisineType}")
    public List<RestaurantDto> getRestaurantsByCuisine(@PathParam("cuisineType") String cuisineType) {
        return restaurantRepository.findByCuisineType(cuisineType)
                .stream()
                .map(restaurantMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir les restaurants ouverts
     */
    @GET
    @Path("/open")
    public List<RestaurantDto> getOpenRestaurants() {
        return restaurantRepository.findOpenRestaurants()
                .stream()
                .map(restaurantMapper::toDto)
                .toList();
    }
    
    /**
     * Obtenir les statistiques d'un restaurant (placeholder pour les stats)
     */
    @GET
    @Path("/{id}/stats/today")
    public Response getTodayStats(@PathParam("id") UUID id) {
        // Pour le moment, retourner des données mockées
        // TODO: Implémenter les vraies statistiques avec les commandes
        return Response.ok("{\"orders\": 12, \"revenue\": 285.50, \"avgOrderValue\": 23.79}").build();
    }
}