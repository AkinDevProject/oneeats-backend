package com.oneeats.restaurant.adapter.web;

import com.oneeats.restaurant.api.cqrs.command.CreateRestaurantCommand;
import com.oneeats.restaurant.api.cqrs.command.UpdateRestaurantCommand;
import com.oneeats.restaurant.api.cqrs.command.ValidateRestaurantCommand;
import com.oneeats.restaurant.api.model.RestaurantDto;
import com.oneeats.restaurant.internal.application.CreateRestaurantUseCase;
import com.oneeats.restaurant.internal.application.UpdateRestaurantUseCase;
import com.oneeats.restaurant.internal.application.ValidateRestaurantUseCase;
import com.oneeats.restaurant.internal.application.GetRestaurantUseCase;
import com.oneeats.restaurant.internal.application.GetAllRestaurantsUseCase;
import com.oneeats.user.internal.entity.User;
import com.oneeats.menu.infrastructure.MenuItemRepository;
import com.oneeats.menu.domain.MenuItem;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Path("/restaurants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RestaurantResource {
    @Inject
    CreateRestaurantUseCase createRestaurantUseCase;
    @Inject
    UpdateRestaurantUseCase updateRestaurantUseCase;
    @Inject
    ValidateRestaurantUseCase validateRestaurantUseCase;
    @Inject
    GetRestaurantUseCase getRestaurantUseCase;
    @Inject
    GetAllRestaurantsUseCase getAllRestaurantsUseCase;
    @Inject
    MenuItemRepository menuItemRepository;

    @POST
    public Response createRestaurant(CreateRestaurantCommand command) {
        // Création d'un User fictif (propriétaire)
        User proprietaire = new User(
            UUID.randomUUID(),
            "Fictif",
            "Proprietaire",
            "proprietaire@demo.com",
            "RESTAURANT"
        );
        UUID id = createRestaurantUseCase.handle(command, proprietaire);
        return Response.status(Response.Status.CREATED)
                .entity(id)
                .build();
    }

    @PUT
    public Response updateRestaurant(UpdateRestaurantCommand command) {
        boolean updated = updateRestaurantUseCase.handle(command);
        if (updated) {
            return Response.ok().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @PATCH
    @Path("/validate")
    public Response validateRestaurant(ValidateRestaurantCommand command) {
        boolean validated = validateRestaurantUseCase.handle(command);
        if (validated) {
            return Response.ok().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getRestaurant(@PathParam("id") UUID id) {
        Optional<RestaurantDto> dto = getRestaurantUseCase.handle(id);
        return dto.map(Response::ok)
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND))
                .build();
    }

    @GET
    public List<RestaurantDto> getAllRestaurants() {
        return getAllRestaurantsUseCase.handle();
    }

    @GET
    @Path("/{id}/menu-items")
    public List<MenuItem> getRestaurantMenuItems(@PathParam("id") UUID restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }
}
