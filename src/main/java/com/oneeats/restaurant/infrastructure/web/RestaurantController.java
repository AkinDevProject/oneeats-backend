package com.oneeats.restaurant.infrastructure.web;

import com.oneeats.restaurant.application.command.CreateRestaurantCommand;
import com.oneeats.restaurant.application.command.CreateRestaurantCommandHandler;
import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.query.GetAllRestaurantsQuery;
import com.oneeats.restaurant.application.query.GetAllRestaurantsQueryHandler;
import com.oneeats.restaurant.application.query.GetRestaurantQuery;
import com.oneeats.restaurant.application.query.GetRestaurantQueryHandler;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

@Path("/api/restaurants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RestaurantController {

    @Inject
    CreateRestaurantCommandHandler createRestaurantCommandHandler;

    @Inject
    GetRestaurantQueryHandler getRestaurantQueryHandler;

    @Inject
    GetAllRestaurantsQueryHandler getAllRestaurantsQueryHandler;

    @POST
    public Response createRestaurant(@Valid CreateRestaurantCommand command) {
        RestaurantDTO restaurant = createRestaurantCommandHandler.handle(command);
        return Response.status(Response.Status.CREATED).entity(restaurant).build();
    }

    @GET
    @Path("/{id}")
    public Response getRestaurantById(@PathParam("id") UUID id) {
        RestaurantDTO restaurant = getRestaurantQueryHandler.handle(new GetRestaurantQuery(id));
        return Response.ok(restaurant).build();
    }

    @GET
    public Response getAllRestaurants() {
        List<RestaurantDTO> restaurants = getAllRestaurantsQueryHandler.handle(new GetAllRestaurantsQuery());
        return Response.ok(restaurants).build();
    }
}