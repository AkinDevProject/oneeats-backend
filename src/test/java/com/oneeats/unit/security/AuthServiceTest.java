package com.oneeats.unit.security;

import com.oneeats.security.application.AuthService;
import com.oneeats.security.infrastructure.entity.RestaurantStaffEntity;
import com.oneeats.security.infrastructure.entity.RestaurantStaffEntity.StaffRole;
import com.oneeats.security.infrastructure.repository.JpaRestaurantStaffRepository;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.infrastructure.entity.UserEntity;
import com.oneeats.user.infrastructure.repository.JpaUserRepository;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.inject.Instance;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.junit.jupiter.api.*;
import org.mockito.*;

import java.lang.reflect.Field;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour AuthService
 * Teste la logique d'authentification et d'autorisation avec mocks Keycloak
 */
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private SecurityIdentity securityIdentity;

    @Mock
    private JsonWebToken jwt;

    @Mock
    private Instance<JsonWebToken> jwtInstance;

    @Mock
    private JpaUserRepository userRepository;

    @Mock
    private JpaRestaurantStaffRepository staffRepository;

    private AuthService authService;

    private AutoCloseable mocks;

    private static final String KEYCLOAK_ID = "keycloak-123-abc";
    private static final UUID USER_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final UUID RESTAURANT_ID = UUID.fromString("660e8400-e29b-41d4-a716-446655440001");

    @BeforeEach
    void setUp() throws Exception {
        mocks = MockitoAnnotations.openMocks(this);

        // Configure le mock Instance pour retourner le JWT mock
        when(jwtInstance.isResolvable()).thenReturn(true);
        when(jwtInstance.get()).thenReturn(jwt);

        // Creer AuthService et injecter les mocks via reflexion
        authService = new AuthService();
        injectField(authService, "securityIdentity", securityIdentity);
        injectField(authService, "jwtInstance", jwtInstance);
        injectField(authService, "userRepository", userRepository);
        injectField(authService, "staffRepository", staffRepository);
    }

    private void injectField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @AfterEach
    void tearDown() throws Exception {
        mocks.close();
    }

    @Nested
    @DisplayName("Current User Resolution")
    class CurrentUserResolution {

        @Test
        @DisplayName("Should return empty for anonymous user")
        void shouldReturnEmptyForAnonymousUser() {
            // Given
            when(securityIdentity.isAnonymous()).thenReturn(true);

            // When
            Optional<UserEntity> result = authService.getCurrentUser();

            // Then
            assertTrue(result.isEmpty());
            verify(userRepository, never()).findByKeycloakId(anyString());
        }

        @Test
        @DisplayName("Should return empty when JWT subject is null")
        void shouldReturnEmptyWhenJwtSubjectIsNull() {
            // Given
            when(securityIdentity.isAnonymous()).thenReturn(false);
            when(jwt.getSubject()).thenReturn(null);

            // When
            Optional<UserEntity> result = authService.getCurrentUser();

            // Then
            assertTrue(result.isEmpty());
            verify(userRepository, never()).findByKeycloakId(anyString());
        }

        @Test
        @DisplayName("Should return existing user")
        void shouldReturnExistingUser() {
            // Given
            when(securityIdentity.isAnonymous()).thenReturn(false);
            when(jwt.getSubject()).thenReturn(KEYCLOAK_ID);

            UserEntity existingUser = createTestUser();
            when(userRepository.findByKeycloakId(KEYCLOAK_ID)).thenReturn(Optional.of(existingUser));

            // When
            Optional<UserEntity> result = authService.getCurrentUser();

            // Then
            assertTrue(result.isPresent());
            assertEquals(existingUser, result.get());
            verify(userRepository).findByKeycloakId(KEYCLOAK_ID);
            verify(userRepository, never()).persist(any(UserEntity.class));
        }

        @Test
        @DisplayName("Should create new user on first login with all required fields")
        void shouldCreateNewUserOnFirstLogin() {
            // Given
            when(securityIdentity.isAnonymous()).thenReturn(false);
            when(jwt.getSubject()).thenReturn(KEYCLOAK_ID);
            when(jwt.getClaim("email")).thenReturn("newuser@test.com");
            when(jwt.getClaim("given_name")).thenReturn("New");
            when(jwt.getClaim("family_name")).thenReturn("User");

            when(userRepository.findByKeycloakId(KEYCLOAK_ID)).thenReturn(Optional.empty());

            // When
            Optional<UserEntity> result = authService.getCurrentUser();

            // Then
            assertTrue(result.isPresent());
            verify(userRepository).persist(any(UserEntity.class));

            UserEntity createdUser = result.get();
            // Basic fields
            assertEquals(KEYCLOAK_ID, createdUser.getKeycloakId());
            assertEquals("newuser@test.com", createdUser.getEmail());
            assertEquals("New", createdUser.getFirstName());
            assertEquals("User", createdUser.getLastName());

            // F8 Fix: Verify all required fields are set correctly
            assertNotNull(createdUser.getId(), "User ID should be generated");
            assertEquals(UserStatus.ACTIVE, createdUser.getStatus(), "New user should be ACTIVE");
            assertEquals("keycloak_managed", createdUser.getPasswordHash(), "Password should be keycloak_managed");
            assertNotNull(createdUser.getCreatedAt(), "CreatedAt should be set");
            // CreatedAt should be recent (within last minute)
            assertTrue(
                createdUser.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusMinutes(1)),
                "CreatedAt should be recent"
            );
        }

        @Test
        @DisplayName("Should map Keycloak claims to user with defaults")
        void shouldMapKeycloakClaimsToUserWithDefaults() {
            // Given
            when(securityIdentity.isAnonymous()).thenReturn(false);
            when(jwt.getSubject()).thenReturn(KEYCLOAK_ID);
            when(jwt.getClaim("email")).thenReturn(null);
            when(jwt.getClaim("given_name")).thenReturn(null);
            when(jwt.getClaim("family_name")).thenReturn(null);

            when(userRepository.findByKeycloakId(KEYCLOAK_ID)).thenReturn(Optional.empty());

            // When
            Optional<UserEntity> result = authService.getCurrentUser();

            // Then
            assertTrue(result.isPresent());
            UserEntity createdUser = result.get();
            assertEquals("Utilisateur", createdUser.getFirstName()); // Default
            assertEquals("", createdUser.getLastName()); // Default
        }
    }

    @Nested
    @DisplayName("Role Management")
    class RoleManagement {

        @Test
        @DisplayName("Should delegate roles to SecurityIdentity")
        void shouldDelegateRolesToSecurityIdentity() {
            // Given
            Set<String> expectedRoles = Set.of("user", "admin");
            when(securityIdentity.getRoles()).thenReturn(expectedRoles);

            // When
            Set<String> result = authService.getCurrentUserRoles();

            // Then
            assertEquals(expectedRoles, result);
            verify(securityIdentity).getRoles();
        }

        @Test
        @DisplayName("Should check role via SecurityIdentity")
        void shouldCheckRoleViaSecurityIdentity() {
            // Given
            when(securityIdentity.hasRole("admin")).thenReturn(true);
            when(securityIdentity.hasRole("superadmin")).thenReturn(false);

            // When & Then
            assertTrue(authService.hasRole("admin"));
            assertFalse(authService.hasRole("superadmin"));
        }
    }

    @Nested
    @DisplayName("Restaurant Access")
    class RestaurantAccess {

        @Test
        @DisplayName("Should check restaurant access via staff repository")
        void shouldCheckRestaurantAccessViaStaffRepository() {
            // Given
            setupAuthenticatedUser();
            when(staffRepository.hasAccessToRestaurant(USER_ID, RESTAURANT_ID)).thenReturn(true);

            // When
            boolean result = authService.hasAccessToRestaurant(RESTAURANT_ID);

            // Then
            assertTrue(result);
            verify(staffRepository).hasAccessToRestaurant(USER_ID, RESTAURANT_ID);
        }

        @Test
        @DisplayName("Should return false for restaurant access when user not authenticated")
        void shouldReturnFalseForRestaurantAccessWhenUserNotAuthenticated() {
            // Given
            when(securityIdentity.isAnonymous()).thenReturn(true);

            // When
            boolean result = authService.hasAccessToRestaurant(RESTAURANT_ID);

            // Then
            assertFalse(result);
            verify(staffRepository, never()).hasAccessToRestaurant(any(), any());
        }

        @Test
        @DisplayName("Should get staff role for restaurant")
        void shouldGetStaffRoleForRestaurant() {
            // Given
            setupAuthenticatedUser();
            RestaurantStaffEntity staffEntity = new RestaurantStaffEntity(USER_ID, RESTAURANT_ID, StaffRole.MANAGER);
            when(staffRepository.findByUserIdAndRestaurantId(USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.of(staffEntity));

            // When
            Optional<StaffRole> result = authService.getStaffRoleForRestaurant(RESTAURANT_ID);

            // Then
            assertTrue(result.isPresent());
            assertEquals(StaffRole.MANAGER, result.get());
        }

        @Test
        @DisplayName("Should return empty when no staff role for restaurant")
        void shouldReturnEmptyWhenNoStaffRoleForRestaurant() {
            // Given
            setupAuthenticatedUser();
            when(staffRepository.findByUserIdAndRestaurantId(USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.empty());

            // When
            Optional<StaffRole> result = authService.getStaffRoleForRestaurant(RESTAURANT_ID);

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("Menu Management Permissions")
    class MenuManagementPermissions {

        @Test
        @DisplayName("Should allow menu management for OWNER")
        void shouldAllowMenuManagementForOwner() {
            // Given
            setupAuthenticatedUser();
            RestaurantStaffEntity staffEntity = new RestaurantStaffEntity(USER_ID, RESTAURANT_ID, StaffRole.OWNER);
            when(staffRepository.findByUserIdAndRestaurantId(USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.of(staffEntity));

            // When
            boolean result = authService.canManageMenu(RESTAURANT_ID);

            // Then
            assertTrue(result);
        }

        @Test
        @DisplayName("Should allow menu management for MANAGER")
        void shouldAllowMenuManagementForManager() {
            // Given
            setupAuthenticatedUser();
            RestaurantStaffEntity staffEntity = new RestaurantStaffEntity(USER_ID, RESTAURANT_ID, StaffRole.MANAGER);
            when(staffRepository.findByUserIdAndRestaurantId(USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.of(staffEntity));

            // When
            boolean result = authService.canManageMenu(RESTAURANT_ID);

            // Then
            assertTrue(result);
        }

        @Test
        @DisplayName("Should deny menu management for STAFF")
        void shouldDenyMenuManagementForStaff() {
            // Given
            setupAuthenticatedUser();
            RestaurantStaffEntity staffEntity = new RestaurantStaffEntity(USER_ID, RESTAURANT_ID, StaffRole.STAFF);
            when(staffRepository.findByUserIdAndRestaurantId(USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.of(staffEntity));

            // When
            boolean result = authService.canManageMenu(RESTAURANT_ID);

            // Then
            assertFalse(result);
        }

        @Test
        @DisplayName("Should deny menu management when not staff")
        void shouldDenyMenuManagementWhenNotStaff() {
            // Given
            setupAuthenticatedUser();
            when(staffRepository.findByUserIdAndRestaurantId(USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.empty());

            // When
            boolean result = authService.canManageMenu(RESTAURANT_ID);

            // Then
            assertFalse(result);
        }
    }

    @Nested
    @DisplayName("Staff Management Permissions")
    class StaffManagementPermissions {

        @Test
        @DisplayName("Should allow staff management only for OWNER")
        void shouldAllowStaffManagementOnlyForOwner() {
            // Given
            setupAuthenticatedUser();
            RestaurantStaffEntity staffEntity = new RestaurantStaffEntity(USER_ID, RESTAURANT_ID, StaffRole.OWNER);
            when(staffRepository.findByUserIdAndRestaurantId(USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.of(staffEntity));

            // When
            boolean result = authService.canManageStaff(RESTAURANT_ID);

            // Then
            assertTrue(result);
        }

        @Test
        @DisplayName("Should deny staff management for MANAGER")
        void shouldDenyStaffManagementForManager() {
            // Given
            setupAuthenticatedUser();
            RestaurantStaffEntity staffEntity = new RestaurantStaffEntity(USER_ID, RESTAURANT_ID, StaffRole.MANAGER);
            when(staffRepository.findByUserIdAndRestaurantId(USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.of(staffEntity));

            // When
            boolean result = authService.canManageStaff(RESTAURANT_ID);

            // Then
            assertFalse(result);
        }

        @Test
        @DisplayName("Should deny staff management for STAFF")
        void shouldDenyStaffManagementForStaff() {
            // Given
            setupAuthenticatedUser();
            RestaurantStaffEntity staffEntity = new RestaurantStaffEntity(USER_ID, RESTAURANT_ID, StaffRole.STAFF);
            when(staffRepository.findByUserIdAndRestaurantId(USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.of(staffEntity));

            // When
            boolean result = authService.canManageStaff(RESTAURANT_ID);

            // Then
            assertFalse(result);
        }
    }

    @Nested
    @DisplayName("User Restaurants")
    class UserRestaurants {

        @Test
        @DisplayName("Should get restaurants for authenticated user")
        void shouldGetRestaurantsForAuthenticatedUser() {
            // Given
            setupAuthenticatedUser();
            List<RestaurantStaffEntity> staffList = List.of(
                new RestaurantStaffEntity(USER_ID, RESTAURANT_ID, StaffRole.OWNER),
                new RestaurantStaffEntity(USER_ID, UUID.randomUUID(), StaffRole.MANAGER)
            );
            when(staffRepository.findByUserId(USER_ID)).thenReturn(staffList);

            // When
            List<RestaurantStaffEntity> result = authService.getCurrentUserRestaurants();

            // Then
            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("Should return empty list for unauthenticated user")
        void shouldReturnEmptyListForUnauthenticatedUser() {
            // Given
            when(securityIdentity.isAnonymous()).thenReturn(true);

            // When
            List<RestaurantStaffEntity> result = authService.getCurrentUserRestaurants();

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("Current User Info DTO")
    class CurrentUserInfoDTO {

        @Test
        @DisplayName("Should build complete CurrentUserDTO")
        void shouldBuildCompleteCurrentUserDTO() {
            // Given
            setupAuthenticatedUser();
            when(securityIdentity.getRoles()).thenReturn(Set.of("user", "restaurant_owner"));

            List<RestaurantStaffEntity> staffList = List.of(
                new RestaurantStaffEntity(USER_ID, RESTAURANT_ID, StaffRole.OWNER)
            );
            when(staffRepository.findByUserId(USER_ID)).thenReturn(staffList);

            // When
            AuthService.CurrentUserDTO result = authService.getCurrentUserInfo();

            // Then
            assertNotNull(result);
            assertEquals(USER_ID.toString(), result.id());
            assertEquals("test@example.com", result.email());
            assertEquals("Test", result.firstName());
            assertEquals("User", result.lastName());
            assertEquals("Test User", result.fullName());
            assertTrue(result.roles().contains("user"));
            assertTrue(result.roles().contains("restaurant_owner"));
            assertEquals(1, result.restaurants().size());
            assertEquals(RESTAURANT_ID.toString(), result.restaurants().get(0).restaurantId());
            assertEquals("OWNER", result.restaurants().get(0).role());
        }

        @Test
        @DisplayName("Should return null for unauthenticated user")
        void shouldReturnNullForUnauthenticatedUser() {
            // Given
            when(securityIdentity.isAnonymous()).thenReturn(true);

            // When
            AuthService.CurrentUserDTO result = authService.getCurrentUserInfo();

            // Then
            assertNull(result);
        }
    }

    @Nested
    @DisplayName("Add Staff Member")
    class AddStaffMember {

        private static final UUID NEW_USER_ID = UUID.fromString("770e8400-e29b-41d4-a716-446655440002");

        @Test
        @DisplayName("Should add new staff member successfully")
        void shouldAddNewStaffMemberSuccessfully() {
            // Given
            when(staffRepository.findByUserIdAndRestaurantId(NEW_USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.empty());

            // When
            RestaurantStaffEntity result = authService.addStaffMember(NEW_USER_ID, RESTAURANT_ID, StaffRole.STAFF);

            // Then
            assertNotNull(result);
            assertEquals(NEW_USER_ID, result.getUserId());
            assertEquals(RESTAURANT_ID, result.getRestaurantId());
            assertEquals(StaffRole.STAFF, result.getStaffRole());
            verify(staffRepository).persist(any(RestaurantStaffEntity.class));
        }

        @Test
        @DisplayName("Should add staff member with OWNER role")
        void shouldAddStaffMemberWithOwnerRole() {
            // Given
            when(staffRepository.findByUserIdAndRestaurantId(NEW_USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.empty());

            // When
            RestaurantStaffEntity result = authService.addStaffMember(NEW_USER_ID, RESTAURANT_ID, StaffRole.OWNER);

            // Then
            assertEquals(StaffRole.OWNER, result.getStaffRole());
            assertNotNull(result.getPermissions(), "Permissions should be set based on role");
        }

        @Test
        @DisplayName("Should add staff member with MANAGER role")
        void shouldAddStaffMemberWithManagerRole() {
            // Given
            when(staffRepository.findByUserIdAndRestaurantId(NEW_USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.empty());

            // When
            RestaurantStaffEntity result = authService.addStaffMember(NEW_USER_ID, RESTAURANT_ID, StaffRole.MANAGER);

            // Then
            assertEquals(StaffRole.MANAGER, result.getStaffRole());
        }

        @Test
        @DisplayName("Should throw exception when user already staff member")
        void shouldThrowExceptionWhenUserAlreadyStaffMember() {
            // Given
            RestaurantStaffEntity existingStaff = new RestaurantStaffEntity(NEW_USER_ID, RESTAURANT_ID, StaffRole.STAFF);
            when(staffRepository.findByUserIdAndRestaurantId(NEW_USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.of(existingStaff));

            // When & Then
            IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> authService.addStaffMember(NEW_USER_ID, RESTAURANT_ID, StaffRole.MANAGER)
            );

            assertEquals("User is already a staff member of this restaurant", exception.getMessage());
            verify(staffRepository, never()).persist(any(RestaurantStaffEntity.class));
        }

        @Test
        @DisplayName("Should not persist when duplicate check fails")
        void shouldNotPersistWhenDuplicateCheckFails() {
            // Given - User is already a staff member
            RestaurantStaffEntity existingStaff = new RestaurantStaffEntity(NEW_USER_ID, RESTAURANT_ID, StaffRole.OWNER);
            when(staffRepository.findByUserIdAndRestaurantId(NEW_USER_ID, RESTAURANT_ID))
                .thenReturn(Optional.of(existingStaff));

            // When
            try {
                authService.addStaffMember(NEW_USER_ID, RESTAURANT_ID, StaffRole.STAFF);
            } catch (IllegalStateException e) {
                // Expected
            }

            // Then
            verify(staffRepository, never()).persist(any(RestaurantStaffEntity.class));
        }
    }

    // Helper methods

    private void setupAuthenticatedUser() {
        when(securityIdentity.isAnonymous()).thenReturn(false);
        when(jwt.getSubject()).thenReturn(KEYCLOAK_ID);

        UserEntity user = createTestUser();
        when(userRepository.findByKeycloakId(KEYCLOAK_ID)).thenReturn(Optional.of(user));
    }

    private UserEntity createTestUser() {
        UserEntity user = new UserEntity();
        user.setId(USER_ID);
        user.setKeycloakId(KEYCLOAK_ID);
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setStatus(UserStatus.ACTIVE);
        return user;
    }
}
