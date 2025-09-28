package com.oneeats.analytics.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO pour les statistiques quotidiennes
 */
public class DailyStatsDTO {

    private LocalDate date;
    private Long orders;
    private BigDecimal revenue;
    private Long newUsers;
    private Long activeRestaurants;

    public DailyStatsDTO() {}

    public DailyStatsDTO(LocalDate date, Long orders, BigDecimal revenue, Long newUsers, Long activeRestaurants) {
        this.date = date;
        this.orders = orders;
        this.revenue = revenue;
        this.newUsers = newUsers;
        this.activeRestaurants = activeRestaurants;
    }

    // Getters et Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Long getOrders() { return orders; }
    public void setOrders(Long orders) { this.orders = orders; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

    public Long getNewUsers() { return newUsers; }
    public void setNewUsers(Long newUsers) { this.newUsers = newUsers; }

    public Long getActiveRestaurants() { return activeRestaurants; }
    public void setActiveRestaurants(Long activeRestaurants) { this.activeRestaurants = activeRestaurants; }
}