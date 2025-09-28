package com.oneeats.analytics.application.dto;

import java.math.BigDecimal;

/**
 * DTO pour les restaurants les plus performants
 */
public class TopRestaurantDTO {

    private String id;
    private String name;
    private String cuisineType;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private Double rating;
    private String imageUrl;

    public TopRestaurantDTO() {}

    public TopRestaurantDTO(String id, String name, String cuisineType, Long totalOrders,
                           BigDecimal totalRevenue, BigDecimal averageOrderValue, Double rating, String imageUrl) {
        this.id = id;
        this.name = name;
        this.cuisineType = cuisineType;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.averageOrderValue = averageOrderValue;
        this.rating = rating;
        this.imageUrl = imageUrl;
    }

    // Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCuisineType() { return cuisineType; }
    public void setCuisineType(String cuisineType) { this.cuisineType = cuisineType; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getAverageOrderValue() { return averageOrderValue; }
    public void setAverageOrderValue(BigDecimal averageOrderValue) { this.averageOrderValue = averageOrderValue; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}