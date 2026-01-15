package com.oneeats.unit.user.application;

import com.oneeats.user.application.dto.AdminUserListDTO;
import com.oneeats.user.application.dto.PagedResponse;
import com.oneeats.user.application.query.AdminUserQuery;
import com.oneeats.user.domain.model.UserStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for AdminUserQuery - Pure unit tests without Quarkus
 */
@DisplayName("AdminUserQuery Unit Tests")
class AdminUserQueryHandlerTest {

    @Nested
    @DisplayName("AdminUserQuery Creation")
    class AdminUserQueryCreation {

        @Test
        @DisplayName("Should create query with default values")
        void shouldCreateQueryWithDefaults() {
            // When
            AdminUserQuery query = new AdminUserQuery(null, null, null, -1, 0, null, null);

            // Then
            assertEquals(0, query.page()); // Negative becomes 0
            assertEquals(20, query.size()); // 0 becomes default 20
            assertEquals("createdAt", query.sortBy()); // null becomes default
            assertEquals("desc", query.sortDirection()); // null becomes default
        }

        @Test
        @DisplayName("Should limit page size to maximum 100")
        void shouldLimitPageSizeToMax100() {
            // When
            AdminUserQuery query = new AdminUserQuery(null, null, null, 0, 500, "createdAt", "desc");

            // Then
            assertEquals(100, query.size());
        }

        @Test
        @DisplayName("Should preserve valid values")
        void shouldPreserveValidValues() {
            // When
            AdminUserQuery query = new AdminUserQuery("john", "ADMIN", UserStatus.ACTIVE, 2, 50, "email", "asc");

            // Then
            assertEquals("john", query.search());
            assertEquals("ADMIN", query.role());
            assertEquals(UserStatus.ACTIVE, query.status());
            assertEquals(2, query.page());
            assertEquals(50, query.size());
            assertEquals("email", query.sortBy());
            assertEquals("asc", query.sortDirection());
        }

        @Test
        @DisplayName("Should create query using factory method")
        void shouldCreateQueryUsingFactoryMethod() {
            // When
            AdminUserQuery query = AdminUserQuery.of("test", "USER", UserStatus.SUSPENDED, 1, 25);

            // Then
            assertEquals("test", query.search());
            assertEquals("USER", query.role());
            assertEquals(UserStatus.SUSPENDED, query.status());
            assertEquals(1, query.page());
            assertEquals(25, query.size());
            assertEquals("createdAt", query.sortBy()); // Default
            assertEquals("desc", query.sortDirection()); // Default
        }
    }

    @Nested
    @DisplayName("PagedResponse Creation")
    class PagedResponseCreation {

        @Test
        @DisplayName("Should calculate pagination correctly")
        void shouldCalculatePaginationCorrectly() {
            // When
            PagedResponse<AdminUserListDTO> response = new PagedResponse<>(
                java.util.List.of(), 0, 10, 45
            );

            // Then
            assertEquals(0, response.currentPage());
            assertEquals(10, response.pageSize());
            assertEquals(45, response.totalElements());
            assertEquals(5, response.totalPages()); // 45/10 = 4.5 -> 5
            assertTrue(response.hasNext()); // Page 0, total 45, size 10 -> has more
            assertFalse(response.hasPrevious()); // First page
        }

        @Test
        @DisplayName("Should detect last page correctly")
        void shouldDetectLastPageCorrectly() {
            // When - Last page
            PagedResponse<AdminUserListDTO> response = new PagedResponse<>(
                java.util.List.of(), 4, 10, 45
            );

            // Then
            assertEquals(4, response.currentPage());
            assertFalse(response.hasNext()); // Last page (page 4 * 10 = 40, + size 10 = 50 > 45)
            assertTrue(response.hasPrevious());
        }

        @Test
        @DisplayName("Should handle single page result")
        void shouldHandleSinglePageResult() {
            // When
            PagedResponse<AdminUserListDTO> response = new PagedResponse<>(
                java.util.List.of(), 0, 20, 5
            );

            // Then
            assertEquals(1, response.totalPages());
            assertFalse(response.hasNext());
            assertFalse(response.hasPrevious());
        }

        @Test
        @DisplayName("Should handle empty result")
        void shouldHandleEmptyResult() {
            // When
            PagedResponse<AdminUserListDTO> response = new PagedResponse<>(
                java.util.List.of(), 0, 20, 0
            );

            // Then
            assertEquals(0, response.totalPages());
            assertFalse(response.hasNext());
            assertFalse(response.hasPrevious());
        }
    }
}
