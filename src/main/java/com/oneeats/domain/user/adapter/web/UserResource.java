package com.oneeats.domain.user.adapter.web;

import com.oneeats.domain.user.api.cqrs.command.CreateUserCommand;
import com.oneeats.domain.user.api.cqrs.command.UpdateUserCommand;
import com.oneeats.domain.user.api.model.UserDto;
import com.oneeats.domain.user.internal.application.CreateUserUseCase;
import com.oneeats.domain.user.internal.application.UpdateUserUseCase;
import com.oneeats.domain.user.internal.application.GetUserUseCase;
import com.oneeats.domain.user.internal.application.GetAllUsersUseCase;
import com.oneeats.domain.user.internal.application.DeleteUserUseCase;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {
    @Inject
    CreateUserUseCase createUserUseCase;
    @Inject
    UpdateUserUseCase updateUserUseCase;
    @Inject
    GetUserUseCase getUserUseCase;
    @Inject
    GetAllUsersUseCase getAllUsersUseCase;
    @Inject
    DeleteUserUseCase deleteUserUseCase;

    @POST
    public Response createUser(CreateUserCommand command) {
        UUID id = createUserUseCase.handle(command);
        return Response.status(Response.Status.CREATED).entity(id).build();
    }

    @PUT
    public Response updateUser(UpdateUserCommand command) {
        boolean updated = updateUserUseCase.handle(command);
        if (updated) {
            return Response.ok().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getUser(@PathParam("id") UUID id) {
        Optional<UserDto> dto = getUserUseCase.handle(id);
        return dto.map(Response::ok)
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND))
                .build();
    }

    @GET
    public List<UserDto> getAllUsers() {
        return getAllUsersUseCase.handle();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") UUID id) {
        // Suppression d'un utilisateur par son identifiant via un use case dédié
        boolean deleted = deleteUserUseCase.handle(id);
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
}
