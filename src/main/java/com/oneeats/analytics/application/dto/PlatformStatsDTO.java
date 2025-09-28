package com.oneeats.analytics.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO pour les statistiques globales de la plateforme
 */
public class PlatformStatsDTO {

    // Statistiques globales
    private Long totalRestaurants;
    private Long activeRestaurants;
    private Long pendingRestaurants;
    private Long totalUsers;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;

    // Statistiques par période
    private Long todayOrders;
    private BigDecimal todayRevenue;
    private Long weekOrders;
    private BigDecimal weekRevenue;
    private Long monthOrders;
    private BigDecimal monthRevenue;

    // Croissance
    private Double revenueGrowth;
    private Double orderGrowth;
    private Double userGrowth;

    // Données temporelles
    private List<DailyStatsDTO> dailyStats;
    private List<TopRestaurantDTO> topRestaurants;
    private List<PopularItemDTO> popularItems;

    // Répartition des commandes par statut
    private Long pendingOrders;
    private Long confirmedOrders;
    private Long preparingOrders;
    private Long readyOrders;
    private Long completedOrders;
    private Long cancelledOrders;

    private LocalDateTime generatedAt;

    public PlatformStatsDTO() {
        this.generatedAt = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getTotalRestaurants() { return totalRestaurants; }
    public void setTotalRestaurants(Long totalRestaurants) { this.totalRestaurants = totalRestaurants; }

    public Long getActiveRestaurants() { return activeRestaurants; }
    public void setActiveRestaurants(Long activeRestaurants) { this.activeRestaurants = activeRestaurants; }

    public Long getPendingRestaurants() { return pendingRestaurants; }
    public void setPendingRestaurants(Long pendingRestaurants) { this.pendingRestaurants = pendingRestaurants; }

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getAverageOrderValue() { return averageOrderValue; }
    public void setAverageOrderValue(BigDecimal averageOrderValue) { this.averageOrderValue = averageOrderValue; }

    public Long getTodayOrders() { return todayOrders; }
    public void setTodayOrders(Long todayOrders) { this.todayOrders = todayOrders; }

    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }

    public Long getWeekOrders() { return weekOrders; }
    public void setWeekOrders(Long weekOrders) { this.weekOrders = weekOrders; }

    public BigDecimal getWeekRevenue() { return weekRevenue; }
    public void setWeekRevenue(BigDecimal weekRevenue) { this.weekRevenue = weekRevenue; }

    public Long getMonthOrders() { return monthOrders; }
    public void setMonthOrders(Long monthOrders) { this.monthOrders = monthOrders; }

    public BigDecimal getMonthRevenue() { return monthRevenue; }
    public void setMonthRevenue(BigDecimal monthRevenue) { this.monthRevenue = monthRevenue; }

    public Double getRevenueGrowth() { return revenueGrowth; }
    public void setRevenueGrowth(Double revenueGrowth) { this.revenueGrowth = revenueGrowth; }

    public Double getOrderGrowth() { return orderGrowth; }
    public void setOrderGrowth(Double orderGrowth) { this.orderGrowth = orderGrowth; }

    public Double getUserGrowth() { return userGrowth; }
    public void setUserGrowth(Double userGrowth) { this.userGrowth = userGrowth; }

    public List<DailyStatsDTO> getDailyStats() { return dailyStats; }
    public void setDailyStats(List<DailyStatsDTO> dailyStats) { this.dailyStats = dailyStats; }

    public List<TopRestaurantDTO> getTopRestaurants() { return topRestaurants; }
    public void setTopRestaurants(List<TopRestaurantDTO> topRestaurants) { this.topRestaurants = topRestaurants; }

    public List<PopularItemDTO> getPopularItems() { return popularItems; }
    public void setPopularItems(List<PopularItemDTO> popularItems) { this.popularItems = popularItems; }

    public Long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(Long pendingOrders) { this.pendingOrders = pendingOrders; }

    public Long getConfirmedOrders() { return confirmedOrders; }
    public void setConfirmedOrders(Long confirmedOrders) { this.confirmedOrders = confirmedOrders; }

    public Long getPreparingOrders() { return preparingOrders; }
    public void setPreparingOrders(Long preparingOrders) { this.preparingOrders = preparingOrders; }

    public Long getReadyOrders() { return readyOrders; }
    public void setReadyOrders(Long readyOrders) { this.readyOrders = readyOrders; }

    public Long getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(Long completedOrders) { this.completedOrders = completedOrders; }

    public Long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(Long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}