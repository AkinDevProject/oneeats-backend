package com.oneeats.user.infrastructure.web;

import com.oneeats.user.application.command.CreateUserCommand;
import com.oneeats.user.application.command.CreateUserCommandHandler;
import com.oneeats.user.application.command.UpdateUserCommand;
import com.oneeats.user.application.command.UpdateUserCommandHandler;
import com.oneeats.user.application.command.DeleteUserCommand;
import com.oneeats.user.application.command.DeleteUserCommandHandler;
import com.oneeats.user.application.command.UpdateUserStatusCommand;
import com.oneeats.user.application.command.UpdateUserStatusCommandHandler;
import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.application.query.GetAllUsersQuery;
import com.oneeats.user.application.query.GetAllUsersQueryHandler;
import com.oneeats.user.application.query.GetUserQuery;
import com.oneeats.user.application.query.GetUserQueryHandler;
import com.oneeats.user.infrastructure.entity.UserEntity;
import com.oneeats.user.infrastructure.repository.JpaUserRepository;
import com.oneeats.user.domain.model.UserStatus;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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

    @Inject
    UpdateUserStatusCommandHandler updateUserStatusCommandHandler;

    @Inject
    JpaUserRepository jpaUserRepository;

    @Inject
    JsonWebToken jwt;

    @Inject
    SecurityIdentity securityIdentity;

    /**
     * Endpoint /me - Recupere ou cree l'utilisateur courant base sur le JWT Keycloak.
     * Synchronise automatiquement l'utilisateur Keycloak avec la base PostgreSQL.
     */
    @GET
    @Path("/me")
    @Authenticated
    @Transactional
    public Response getCurrentUser() {
        // Recuperer les infos du JWT Keycloak
        String email = jwt.getClaim("email");
        String firstName = jwt.getClaim("given_name");
        String lastName = jwt.getClaim("family_name");
        String keycloakId = jwt.getSubject();

        if (email == null || email.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Email not found in JWT token")
                .build();
        }

        // Chercher l'utilisateur par email
        Optional<UserEntity> existingUser = jpaUserRepository.findEntityByEmail(email);

        UserEntity userEntity;
        if (existingUser.isPresent()) {
            // Utilisateur existe - mettre a jour le keycloakId si necessaire
            userEntity = existingUser.get();
            if (userEntity.getKeycloakId() == null && keycloakId != null) {
                userEntity.setKeycloakId(keycloakId);
            }
        } else {
            // Utilisateur n'existe pas - le creer
            userEntity = new UserEntity();
            userEntity.setId(UUID.randomUUID());
            userEntity.setEmail(email);
            userEntity.setFirstName(firstName != null ? firstName : "");
            userEntity.setLastName(lastName != null ? lastName : "");
            userEntity.setKeycloakId(keycloakId);
            userEntity.setStatus(UserStatus.ACTIVE);
            userEntity.setCreatedAt(LocalDateTime.now());
            userEntity.setUpdatedAt(LocalDateTime.now());
            jpaUserRepository.persist(userEntity);
        }

        // Convertir en DTO
        UserDTO dto = new UserDTO(
            userEntity.getId(),
            userEntity.getFirstName(),
            userEntity.getLastName(),
            userEntity.getEmail(),
            userEntity.getStatus(),
            userEntity.getCreatedAt(),
            userEntity.getUpdatedAt()
        );

        return Response.ok(dto).build();
    }

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

    @PATCH
    @Path("/{id}/status")
    public Response updateUserStatus(@PathParam("id") UUID id, @Valid UpdateUserStatusCommand command) {
        UpdateUserStatusCommand commandWithId = new UpdateUserStatusCommand(id, command.status());
        UserDTO user = updateUserStatusCommandHandler.handle(commandWithId);
        return Response.ok(user).build();
    }
}