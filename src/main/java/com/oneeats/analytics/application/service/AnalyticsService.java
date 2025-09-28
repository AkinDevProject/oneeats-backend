package com.oneeats.analytics.application.service;

import com.oneeats.analytics.application.dto.*;
import com.oneeats.order.domain.model.OrderStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service pour calculer les analytics de la plateforme
 */
@ApplicationScoped
public class AnalyticsService {

    @Inject
    EntityManager entityManager;

    public PlatformStatsDTO getPlatformStats() {
        PlatformStatsDTO stats = new PlatformStatsDTO();

        // Statistiques globales des restaurants
        calculateRestaurantStats(stats);

        // Statistiques globales des utilisateurs
        calculateUserStats(stats);

        // Statistiques globales des commandes
        calculateOrderStats(stats);

        // Statistiques par période
        calculatePeriodStats(stats);

        // Calcul des croissances
        calculateGrowthStats(stats);

        // Top restaurants
        stats.setTopRestaurants(getTopRestaurants());

        // Articles populaires
        stats.setPopularItems(getPopularItems());

        // Données quotidiennes des 7 derniers jours
        stats.setDailyStats(getDailyStats());

        return stats;
    }

    private void calculateRestaurantStats(PlatformStatsDTO stats) {
        // Total restaurants
        Query totalQuery = entityManager.createQuery("SELECT COUNT(r) FROM RestaurantEntity r");
        stats.setTotalRestaurants(((Number) totalQuery.getSingleResult()).longValue());

        // Restaurants actifs (APPROVED + isActive = true)
        Query activeQuery = entityManager.createQuery(
            "SELECT COUNT(r) FROM RestaurantEntity r WHERE r.status = 'APPROVED' AND r.isActive = true"
        );
        stats.setActiveRestaurants(((Number) activeQuery.getSingleResult()).longValue());

        // Restaurants en attente
        Query pendingQuery = entityManager.createQuery(
            "SELECT COUNT(r) FROM RestaurantEntity r WHERE r.status = 'PENDING'"
        );
        stats.setPendingRestaurants(((Number) pendingQuery.getSingleResult()).longValue());
    }

    private void calculateUserStats(PlatformStatsDTO stats) {
        Query userQuery = entityManager.createQuery("SELECT COUNT(u) FROM UserEntity u");
        stats.setTotalUsers(((Number) userQuery.getSingleResult()).longValue());
    }

    private void calculateOrderStats(PlatformStatsDTO stats) {
        // Total commandes
        Query totalOrdersQuery = entityManager.createQuery("SELECT COUNT(o) FROM OrderEntity o");
        stats.setTotalOrders(((Number) totalOrdersQuery.getSingleResult()).longValue());

        // Total revenus (commandes complétées uniquement)
        Query revenueQuery = entityManager.createQuery(
            "SELECT COALESCE(SUM(CAST(o.totalAmount as double)), 0.0) FROM OrderEntity o WHERE o.status = :status"
        );
        revenueQuery.setParameter("status", OrderStatus.COMPLETED);
        Number totalRevenueNum = (Number) revenueQuery.getSingleResult();
        BigDecimal totalRevenue = BigDecimal.valueOf(totalRevenueNum.doubleValue());
        stats.setTotalRevenue(totalRevenue);

        // Panier moyen
        if (stats.getTotalOrders() > 0) {
            Query avgQuery = entityManager.createQuery(
                "SELECT AVG(CAST(o.totalAmount as double)) FROM OrderEntity o WHERE o.status = :status"
            );
            avgQuery.setParameter("status", OrderStatus.COMPLETED);
            Number avgNum = (Number) avgQuery.getSingleResult();
            BigDecimal avg = avgNum != null ? BigDecimal.valueOf(avgNum.doubleValue()).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            stats.setAverageOrderValue(avg);
        } else {
            stats.setAverageOrderValue(BigDecimal.ZERO);
        }

        // Répartition par statut
        calculateOrderStatusStats(stats);
    }

    private void calculateOrderStatusStats(PlatformStatsDTO stats) {
        for (OrderStatus status : OrderStatus.values()) {
            Query statusQuery = entityManager.createQuery(
                "SELECT COUNT(o) FROM OrderEntity o WHERE o.status = :status"
            );
            statusQuery.setParameter("status", status);
            Long count = ((Number) statusQuery.getSingleResult()).longValue();

            switch (status) {
                case PENDING -> stats.setPendingOrders(count);
                case CONFIRMED -> stats.setConfirmedOrders(count);
                case PREPARING -> stats.setPreparingOrders(count);
                case READY -> stats.setReadyOrders(count);
                case COMPLETED -> stats.setCompletedOrders(count);
                case CANCELLED -> stats.setCancelledOrders(count);
            }
        }
    }

    private void calculatePeriodStats(PlatformStatsDTO stats) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);

        // Stats aujourd'hui
        stats.setTodayOrders(getOrderCountForPeriod(startOfToday, now));
        stats.setTodayRevenue(getRevenueForPeriod(startOfToday, now));

        // Stats semaine
        stats.setWeekOrders(getOrderCountForPeriod(startOfWeek, now));
        stats.setWeekRevenue(getRevenueForPeriod(startOfWeek, now));

        // Stats mois
        stats.setMonthOrders(getOrderCountForPeriod(startOfMonth, now));
        stats.setMonthRevenue(getRevenueForPeriod(startOfMonth, now));
    }

    private Long getOrderCountForPeriod(LocalDateTime start, LocalDateTime end) {
        Query query = entityManager.createQuery(
            "SELECT COUNT(o) FROM OrderEntity o WHERE o.createdAt >= :start AND o.createdAt <= :end"
        );
        query.setParameter("start", start);
        query.setParameter("end", end);
        return ((Number) query.getSingleResult()).longValue();
    }

    private BigDecimal getRevenueForPeriod(LocalDateTime start, LocalDateTime end) {
        Query query = entityManager.createQuery(
            "SELECT COALESCE(SUM(CAST(o.totalAmount as double)), 0.0) FROM OrderEntity o " +
            "WHERE o.createdAt >= :start AND o.createdAt <= :end AND o.status = :status"
        );
        query.setParameter("start", start);
        query.setParameter("end", end);
        query.setParameter("status", OrderStatus.COMPLETED);
        Number result = (Number) query.getSingleResult();
        return result != null ? BigDecimal.valueOf(result.doubleValue()) : BigDecimal.ZERO;
    }

    private void calculateGrowthStats(PlatformStatsDTO stats) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastWeek = now.minusDays(7);
        LocalDateTime twoWeeksAgo = now.minusDays(14);

        // Croissance revenus
        BigDecimal thisWeekRevenue = getRevenueForPeriod(lastWeek, now);
        BigDecimal lastWeekRevenue = getRevenueForPeriod(twoWeeksAgo, lastWeek);
        stats.setRevenueGrowth(calculateGrowthPercentage(lastWeekRevenue, thisWeekRevenue));

        // Croissance commandes
        Long thisWeekOrders = getOrderCountForPeriod(lastWeek, now);
        Long lastWeekOrders = getOrderCountForPeriod(twoWeeksAgo, lastWeek);
        stats.setOrderGrowth(calculateGrowthPercentage(
            BigDecimal.valueOf(lastWeekOrders),
            BigDecimal.valueOf(thisWeekOrders)
        ));

        // Croissance utilisateurs (simplifiée)
        stats.setUserGrowth(5.2); // Mock pour le moment
    }

    private Double calculateGrowthPercentage(BigDecimal oldValue, BigDecimal newValue) {
        if (oldValue.compareTo(BigDecimal.ZERO) == 0) {
            return newValue.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return newValue.subtract(oldValue)
                .divide(oldValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    @SuppressWarnings("unchecked")
    private List<TopRestaurantDTO> getTopRestaurants() {
        Query query = entityManager.createQuery(
            "SELECT r.id, r.name, r.cuisineType, COUNT(o), COALESCE(SUM(CAST(o.totalAmount as double)), 0.0), " +
            "COALESCE(AVG(CAST(o.totalAmount as double)), 0.0), r.rating, r.imageUrl " +
            "FROM RestaurantEntity r LEFT JOIN OrderEntity o ON r.id = o.restaurantId " +
            "WHERE o.status = :status OR o.status IS NULL " +
            "GROUP BY r.id, r.name, r.cuisineType, r.rating, r.imageUrl " +
            "ORDER BY COALESCE(SUM(CAST(o.totalAmount as double)), 0.0) DESC"
        );
        query.setParameter("status", OrderStatus.COMPLETED);
        query.setMaxResults(5);

        List<Object[]> results = query.getResultList();
        List<TopRestaurantDTO> topRestaurants = new ArrayList<>();

        for (Object[] result : results) {
            topRestaurants.add(new TopRestaurantDTO(
                result[0].toString(),         // id (convert UUID to String)
                (String) result[1],           // name
                (String) result[2],           // cuisineType
                ((Number) result[3]).longValue(), // totalOrders
                BigDecimal.valueOf(((Number) result[4]).doubleValue()), // totalRevenue
                BigDecimal.valueOf(((Number) result[5]).doubleValue()).setScale(2, RoundingMode.HALF_UP), // averageOrderValue
                ((Number) result[6]).doubleValue(), // rating
                (String) result[7]            // imageUrl
            ));
        }

        return topRestaurants;
    }

    @SuppressWarnings("unchecked")
    private List<PopularItemDTO> getPopularItems() {
        Query query = entityManager.createQuery(
            "SELECT oi.menuItemName, mi.category, r.name, SUM(oi.quantity), COUNT(DISTINCT oi.order), " +
            "SUM(CAST(oi.unitPrice as double) * oi.quantity), AVG(CAST(oi.unitPrice as double)) " +
            "FROM OrderItemEntity oi " +
            "LEFT JOIN MenuItemEntity mi ON oi.menuItemId = mi.id " +
            "LEFT JOIN RestaurantEntity r ON oi.order.restaurantId = r.id " +
            "WHERE oi.order.status = :status " +
            "GROUP BY oi.menuItemName, mi.category, r.name " +
            "ORDER BY SUM(oi.quantity) DESC"
        );
        query.setParameter("status", OrderStatus.COMPLETED);
        query.setMaxResults(10);

        List<Object[]> results = query.getResultList();
        List<PopularItemDTO> popularItems = new ArrayList<>();

        for (Object[] result : results) {
            popularItems.add(new PopularItemDTO(
                "",                           // id (pas nécessaire pour l'affichage)
                (String) result[0],           // name
                result[1] != null ? (String) result[1] : "N/A", // category
                result[2] != null ? (String) result[2] : "N/A", // restaurantName
                ((Number) result[3]).longValue(), // totalQuantity
                ((Number) result[4]).longValue(), // totalOrders
                BigDecimal.valueOf(((Number) result[5]).doubleValue()), // totalRevenue
                BigDecimal.valueOf(((Number) result[6]).doubleValue()).setScale(2, RoundingMode.HALF_UP) // averagePrice
            ));
        }

        return popularItems;
    }

    private List<DailyStatsDTO> getDailyStats() {
        List<DailyStatsDTO> dailyStats = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(23, 59, 59);

            Long orders = getOrderCountForPeriod(start, end);
            BigDecimal revenue = getRevenueForPeriod(start, end);

            dailyStats.add(new DailyStatsDTO(date, orders, revenue, 0L, 0L));
        }

        return dailyStats;
    }
}