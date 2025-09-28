package com.oneeats.analytics.application.dto;

import java.math.BigDecimal;

/**
 * DTO pour les articles les plus populaires
 */
public class PopularItemDTO {

    private String id;
    private String name;
    private String category;
    private String restaurantName;
    private Long totalQuantity;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal averagePrice;

    public PopularItemDTO() {}

    public PopularItemDTO(String id, String name, String category, String restaurantName,
                         Long totalQuantity, Long totalOrders, BigDecimal totalRevenue, BigDecimal averagePrice) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.restaurantName = restaurantName;
        this.totalQuantity = totalQuantity;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.averagePrice = averagePrice;
    }

    // Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public Long getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Long totalQuantity) { this.totalQuantity = totalQuantity; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getAveragePrice() { return averagePrice; }
    public void setAveragePrice(BigDecimal averagePrice) { this.averagePrice = averagePrice; }
}