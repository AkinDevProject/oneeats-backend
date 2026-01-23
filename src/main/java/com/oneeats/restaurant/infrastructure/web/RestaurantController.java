package com.oneeats.restaurant.infrastructure.web;

import com.oneeats.restaurant.application.command.CreateRestaurantCommand;
import com.oneeats.restaurant.application.command.CreateRestaurantCommandHandler;
import com.oneeats.restaurant.application.command.UpdateRestaurantCommand;
import com.oneeats.restaurant.application.command.UpdateRestaurantCommandHandler;
import com.oneeats.restaurant.application.command.ToggleRestaurantStatusCommand;
import com.oneeats.restaurant.application.command.ToggleRestaurantStatusCommandHandler;
import com.oneeats.restaurant.application.command.UploadRestaurantImageCommand;
import com.oneeats.restaurant.application.command.UploadRestaurantImageCommandHandler;
import com.oneeats.restaurant.application.command.DeleteRestaurantImageCommand;
import com.oneeats.restaurant.application.command.DeleteRestaurantImageCommandHandler;
import com.oneeats.restaurant.application.command.DeleteRestaurantCommand;
import com.oneeats.restaurant.application.command.DeleteRestaurantCommandHandler;
import com.oneeats.restaurant.application.command.UpdateRestaurantStatusCommand;
import com.oneeats.restaurant.application.command.UpdateRestaurantStatusCommandHandler;
import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.query.GetAllRestaurantsQuery;
import com.oneeats.restaurant.application.query.GetAllRestaurantsQueryHandler;
import com.oneeats.restaurant.application.query.GetRestaurantQuery;
import com.oneeats.restaurant.application.query.GetRestaurantQueryHandler;
import com.oneeats.restaurant.application.query.GetActiveRestaurantsQuery;
import com.oneeats.restaurant.application.query.GetActiveRestaurantsQueryHandler;
import com.oneeats.restaurant.application.query.GetRestaurantByOwnerQuery;
import com.oneeats.restaurant.application.query.GetRestaurantByOwnerQueryHandler;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.security.Roles;
import com.oneeats.security.application.AuthService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import java.util.List;
import java.util.UUID;

@Path("/api/restaurants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RestaurantController {

    @Inject
    AuthService authService;

    @Inject
    CreateRestaurantCommandHandler createRestaurantCommandHandler;

    @Inject
    UpdateRestaurantCommandHandler updateRestaurantCommandHandler;

    @Inject
    GetRestaurantQueryHandler getRestaurantQueryHandler;

    @Inject
    GetAllRestaurantsQueryHandler getAllRestaurantsQueryHandler;

    @Inject
    ToggleRestaurantStatusCommandHandler toggleRestaurantStatusCommandHandler;

    @Inject
    UploadRestaurantImageCommandHandler uploadRestaurantImageCommandHandler;

    @Inject
    DeleteRestaurantImageCommandHandler deleteRestaurantImageCommandHandler;

    @Inject
    DeleteRestaurantCommandHandler deleteRestaurantCommandHandler;

    @Inject
    UpdateRestaurantStatusCommandHandler updateRestaurantStatusCommandHandler;

    @Inject
    GetActiveRestaurantsQueryHandler getActiveRestaurantsQueryHandler;

    @Inject
    GetRestaurantByOwnerQueryHandler getRestaurantByOwnerQueryHandler;

    @POST
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response createRestaurant(@Valid CreateRestaurantCommand command) {
        RestaurantDTO restaurant = createRestaurantCommandHandler.handle(command);
        return Response.status(Response.Status.CREATED).entity(restaurant).build();
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public Response getRestaurantById(@PathParam("id") UUID id) {
        RestaurantDTO restaurant = getRestaurantQueryHandler.handle(new GetRestaurantQuery(id));
        return Response.ok(restaurant).build();
    }

    @GET
    @PermitAll
    public Response getAllRestaurants() {
        List<RestaurantDTO> restaurants = getAllRestaurantsQueryHandler.handle(new GetAllRestaurantsQuery());
        return Response.ok(restaurants).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response updateRestaurant(@PathParam("id") UUID id, UpdateRestaurantCommand command) {
        // Verifier l'acces au restaurant (sauf admin)
        if (!authService.hasRole(Roles.ADMIN)) {
            authService.requireRestaurantAccess(id);
        }

        UpdateRestaurantCommand commandWithId = new UpdateRestaurantCommand(
            id,
            command.name(),
            command.description(),
            command.address(),
            command.phone(),
            command.email(),
            command.cuisineType(),
            command.isOpen(),
            command.schedule()
        );
        RestaurantDTO restaurant = updateRestaurantCommandHandler.handle(commandWithId);
        return Response.ok(restaurant).build();
    }

    @PATCH
    @Path("/{id}/toggle-status")
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response toggleRestaurantStatus(@PathParam("id") UUID id, ToggleRestaurantStatusCommand command) {
        // Verifier l'acces au restaurant (sauf admin)
        if (!authService.hasRole(Roles.ADMIN)) {
            authService.requireRestaurantAccess(id);
        }

        ToggleRestaurantStatusCommand commandWithId = new ToggleRestaurantStatusCommand(
            id,
            command.isOpen()
        );
        RestaurantDTO restaurant = toggleRestaurantStatusCommandHandler.handle(commandWithId);
        return Response.ok(restaurant).build();
    }

    @POST
    @Path("/{id}/image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response uploadRestaurantImage(
        @PathParam("id") UUID id,
        @FormParam("file") InputStream fileStream,
        @FormParam("filename") String filename
    ) {
        // Verifier l'acces au restaurant (sauf admin)
        if (!authService.hasRole(Roles.ADMIN)) {
            authService.requireRestaurantAccess(id);
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

            // Read file completely into memory to avoid Windows lock issues
            byte[] fileBytes;
            try {
                fileBytes = fileStream.readAllBytes();
            } catch (IOException e) {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Failed to read uploaded file")
                    .build();
            }

            if (fileBytes.length == 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Empty file")
                    .build();
            }

            // Create new stream from bytes
            InputStream byteStream = new ByteArrayInputStream(fileBytes);
            
            UploadRestaurantImageCommand command = new UploadRestaurantImageCommand(
                id,
                byteStream,
                filename,
                fileBytes.length
            );

            RestaurantDTO restaurant = uploadRestaurantImageCommandHandler.handle(command);
            return Response.ok(restaurant).build();

        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(e.getMessage())
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
    public Response deleteRestaurantImage(@PathParam("id") UUID id) {
        // Verifier l'acces au restaurant (sauf admin)
        if (!authService.hasRole(Roles.ADMIN)) {
            authService.requireRestaurantAccess(id);
        }

        try {
            DeleteRestaurantImageCommand command = new DeleteRestaurantImageCommand(id);
            RestaurantDTO restaurant = deleteRestaurantImageCommandHandler.handle(command);
            return Response.ok(restaurant).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Failed to delete image: " + e.getMessage())
                .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed(Roles.ADMIN)
    public Response deleteRestaurant(@PathParam("id") UUID id) {
        try {
            DeleteRestaurantCommand command = new DeleteRestaurantCommand(id);
            deleteRestaurantCommandHandler.handle(command);
            return Response.status(Response.Status.NO_CONTENT).build();

        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Failed to delete restaurant: " + e.getMessage())
                .build();
        }
    }

    @PUT
    @Path("/{id}/status")
    @RolesAllowed(Roles.ADMIN)
    public Response updateRestaurantStatus(@PathParam("id") UUID id, @QueryParam("status") String statusStr) {
        try {
            RestaurantStatus status = RestaurantStatus.valueOf(statusStr.toUpperCase());
            UpdateRestaurantStatusCommand command = new UpdateRestaurantStatusCommand(id, status);
            RestaurantDTO restaurant = updateRestaurantStatusCommandHandler.handle(command);
            return Response.ok(restaurant).build();

        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Invalid status or restaurant not found: " + e.getMessage())
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Failed to update restaurant status: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/active")
    @PermitAll
    public Response getActiveRestaurants() {
        List<RestaurantDTO> restaurants = getActiveRestaurantsQueryHandler.handle(new GetActiveRestaurantsQuery());
        return Response.ok(restaurants).build();
    }

    @GET
    @Path("/owner/{ownerId}")
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response getRestaurantByOwner(@PathParam("ownerId") UUID ownerId) {
        try {
            RestaurantDTO restaurant = getRestaurantByOwnerQueryHandler.handle(new GetRestaurantByOwnerQuery(ownerId));
            return Response.ok(restaurant).build();

        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Failed to get restaurant by owner: " + e.getMessage())
                .build();
        }
    }
}