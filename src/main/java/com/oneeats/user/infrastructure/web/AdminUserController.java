package com.oneeats.user.infrastructure.web;

import com.oneeats.order.infrastructure.entity.OrderEntity;
import com.oneeats.shared.domain.exception.ValidationException;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.user.application.dto.AdminUserDTO;
import com.oneeats.user.application.dto.AdminUserListDTO;
import com.oneeats.user.application.dto.PagedResponse;
import com.oneeats.user.application.dto.UpdateAdminUserRequest;
import com.oneeats.user.application.query.AdminUserQuery;
import com.oneeats.user.application.query.AdminUserQueryHandler;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.user.domain.specification.UniqueEmailSpecification;
import com.oneeats.user.infrastructure.entity.UserEntity;
import com.oneeats.security.Roles;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Admin controller for user management
 * Provides paginated list, search, filters, and CRUD operations
 *
 * Note: @RolesAllowed(Roles.ADMIN) commented until Epic 1 (Auth) is implemented
 */
@Path("/api/admin/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed(Roles.ADMIN)
public class AdminUserController {

    @Inject
    AdminUserQueryHandler queryHandler;

    @Inject
    IUserRepository userRepository;

    @Inject
    UniqueEmailSpecification uniqueEmailSpec;

    /**
     * GET /api/admin/users - List users with pagination, search, and filters
     * AC-1: Paginated list
     * AC-2: Search by firstName, lastName, email
     * AC-3: Filter by role
     * AC-4: Filter by status
     */
    @GET
    public Response getUsers(
        @QueryParam("page") @DefaultValue("0") int page,
        @QueryParam("size") @DefaultValue("20") int size,
        @QueryParam("search") String search,
        @QueryParam("role") String role,
        @QueryParam("status") UserStatus status,
        @QueryParam("sortBy") @DefaultValue("createdAt") String sortBy,
        @QueryParam("sortDirection") @DefaultValue("desc") String sortDirection
    ) {
        AdminUserQuery query = new AdminUserQuery(search, role, status, page, size, sortBy, sortDirection);
        PagedResponse<AdminUserListDTO> response = queryHandler.handle(query);
        return Response.ok(response).build();
    }

    /**
     * GET /api/admin/users/{id} - Get user details with order statistics
     * AC-7: User details with order history summary
     */
    @GET
    @Path("/{id}")
    @Transactional
    public Response getUserById(@PathParam("id") UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found: " + id));

        // Get order statistics
        long orderCount = OrderEntity.count("userId", id);
        LocalDateTime lastOrderDate = null;

        OrderEntity lastOrder = OrderEntity.find("userId = ?1 order by createdAt desc", id)
            .firstResult();
        if (lastOrder != null) {
            lastOrderDate = lastOrder.getCreatedAt();
        }

        // Get full user entity for additional fields
        UserEntity entity = UserEntity.findById(id);

        AdminUserDTO dto = new AdminUserDTO(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail().getValue(),
            entity != null ? entity.getPhone() : null,
            entity != null ? entity.getAddress() : null,
            user.getStatus(),
            "USER", // Default role - will be enhanced with Keycloak
            user.getCreatedAt(),
            user.getUpdatedAt(),
            orderCount,
            lastOrderDate
        );

        return Response.ok(dto).build();
    }

    /**
     * PUT /api/admin/users/{id} - Update user information
     * AC-5: Update user with email uniqueness validation
     */
    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateUser(@PathParam("id") UUID id, @Valid UpdateAdminUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found: " + id));

        // Check email uniqueness if email is being changed
        if (request.email() != null && !request.email().equals(user.getEmail().getValue())) {
            Email newEmail = new Email(request.email());
            if (userRepository.existsByEmail(newEmail)) {
                throw new ValidationException("Email already exists: " + request.email());
            }
            user.updateEmail(request.email());
        }

        // Update profile fields
        if (request.firstName() != null || request.lastName() != null) {
            user.updateProfile(
                request.firstName() != null ? request.firstName() : user.getFirstName(),
                request.lastName() != null ? request.lastName() : user.getLastName()
            );
        }

        // Update phone and address directly on entity
        UserEntity entity = UserEntity.findById(id);
        if (entity != null) {
            if (request.phone() != null) {
                entity.setPhone(request.phone());
            }
            if (request.address() != null) {
                entity.setAddress(request.address());
            }
            entity.setUpdatedAt(LocalDateTime.now());
        }

        // Save user (domain level changes)
        User savedUser = userRepository.save(user);

        // Return updated user details
        return getUserById(id);
    }

    /**
     * PATCH /api/admin/users/{id}/status - Change user status
     * AC-6: Status change (ACTIVE, SUSPENDED, INACTIVE)
     */
    @PATCH
    @Path("/{id}/status")
    @Transactional
    public Response updateUserStatus(@PathParam("id") UUID id, StatusChangeRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found: " + id));

        if (request.status() == null) {
            throw new ValidationException("Status is required");
        }

        user.updateStatus(request.status());
        userRepository.save(user);

        // Return updated user details
        return getUserById(id);
    }

    /**
     * Request DTO for status change
     */
    public record StatusChangeRequest(UserStatus status) {}
}
