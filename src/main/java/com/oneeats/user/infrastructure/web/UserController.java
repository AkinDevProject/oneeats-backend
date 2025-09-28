package com.oneeats.user.infrastructure.web;

import com.oneeats.user.application.command.CreateUserCommand;
import com.oneeats.user.application.command.CreateUserCommandHandler;
import com.oneeats.user.application.command.UpdateUserCommand;
import com.oneeats.user.application.command.UpdateUserCommandHandler;
import com.oneeats.user.application.command.DeleteUserCommand;
import com.oneeats.user.application.command.DeleteUserCommandHandler;
import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.application.query.GetAllUsersQuery;
import com.oneeats.user.application.query.GetAllUsersQueryHandler;
import com.oneeats.user.application.query.GetUserQuery;
import com.oneeats.user.application.query.GetUserQueryHandler;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {

    @Inject
    CreateUserCommandHandler createUserCommandHandler;

    @Inject
    GetUserQueryHandler getUserQueryHandler;

    @Inject
    GetAllUsersQueryHandler getAllUsersQueryHandler;

    @Inject
    UpdateUserCommandHandler updateUserCommandHandler;

    @Inject
    DeleteUserCommandHandler deleteUserCommandHandler;

    @POST
    public Response createUser(@Valid CreateUserCommand command) {
        UserDTO user = createUserCommandHandler.handle(command);
        return Response.status(Response.Status.CREATED).entity(user).build();
    }

    @GET
    @Path("/{id}")
    public Response getUserById(@PathParam("id") UUID id) {
        UserDTO user = getUserQueryHandler.handle(new GetUserQuery(id));
        return Response.ok(user).build();
    }

    @GET
    public Response getAllUsers() {
        List<UserDTO> users = getAllUsersQueryHandler.handle(new GetAllUsersQuery());
        return Response.ok(users).build();
    }

    @PUT
    @Path("/{id}")
    public Response updateUser(@PathParam("id") UUID id, @Valid UpdateUserCommand command) {
        UpdateUserCommand commandWithId = new UpdateUserCommand(id, command.firstName(), command.lastName(), command.email());
        UserDTO user = updateUserCommandHandler.handle(commandWithId);
        return Response.ok(user).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") UUID id) {
        deleteUserCommandHandler.handle(new DeleteUserCommand(id));
        return Response.noContent().build();
    }
}