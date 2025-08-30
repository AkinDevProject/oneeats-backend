package com.oneeats.user.infrastructure;

import com.oneeats.user.api.CreateUserRequest;
import com.oneeats.user.api.UserDto;
import com.oneeats.user.domain.User;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour les utilisateurs
 * Endpoints : /api/users
 */
@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {
    
    private static final Logger LOG = Logger.getLogger(UserResource.class);
    
    @Inject
    UserRepository userRepository;
    
    @Inject
    UserMapper userMapper;
    
    /**
     * Créer un nouvel utilisateur
     * POST /api/users
     */
    @POST
    @Transactional
    public Response createUser(@Valid CreateUserRequest request) {
        LOG.infof("Création d'un utilisateur avec l'email %s", request.email());
        
        // Vérifier que l'email n'existe pas déjà
        if (userRepository.existsByEmail(request.email())) {
            return Response.status(Response.Status.CONFLICT)
                .entity("Un utilisateur avec cet email existe déjà")
                .build();
        }
        
        try {
            // Créer l'utilisateur (le hash du mot de passe devrait être fait par un service)
            User user = new User(
                request.email(),
                hashPassword(request.password()), // TODO: utiliser un service de hash sécurisé
                request.firstName(),
                request.lastName()
            );
            
            if (request.phone() != null) {
                user.updateProfile(user.getFirstName(), user.getLastName(), request.phone(), request.address());
            }
            
            userRepository.persist(user);
            
            UserDto userDto = userMapper.toDto(user);
            return Response.status(Response.Status.CREATED)
                .entity(userDto)
                .build();
                
        } catch (Exception e) {
            LOG.errorf(e, "Erreur lors de la création de l'utilisateur: %s", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Erreur lors de la création de l'utilisateur")
                .build();
        }
    }
    
    /**
     * Obtenir un utilisateur par ID
     * GET /api/users/{id}
     */
    @GET
    @Path("/{id}")
    public Response getUser(@PathParam("id") UUID userId) {
        User user = userRepository.findById(userId);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        UserDto userDto = userMapper.toDto(user);
        return Response.ok(userDto).build();
    }
    
    /**
     * Lister tous les utilisateurs actifs
     * GET /api/users
     */
    @GET
    public Response getUsers(@QueryParam("search") String searchTerm) {
        List<User> users;
        
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            users = userRepository.searchByName(searchTerm.trim());
        } else {
            users = userRepository.findActiveUsers();
        }
        
        List<UserDto> userDtos = userMapper.toDtoList(users);
        return Response.ok(userDtos).build();
    }
    
    /**
     * Désactiver un utilisateur
     * DELETE /api/users/{id}
     */
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deactivateUser(@PathParam("id") UUID userId) {
        User user = userRepository.findById(userId);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        user.deactivate();
        userRepository.persist(user);
        
        return Response.noContent().build();
    }
    
    // TODO: Remplacer par un service de sécurité approprié avec BCrypt
    private String hashPassword(String password) {
        return "HASHED_" + password; // Implémentation temporaire
    }
}