package com.oneeats.order.application.dto;

import java.math.BigDecimal;

/**
 * DTO pour les statistiques de commandes
 */
public class OrderStatsDTO {
    
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long pendingOrders;
    private Long preparingOrders;
    private Long readyOrders;
    private Long completedOrders;
    private BigDecimal averageOrderValue;
    
    public OrderStatsDTO() {}
    
    public OrderStatsDTO(Long totalOrders, BigDecimal totalRevenue, Long pendingOrders, 
                        Long preparingOrders, Long readyOrders, Long completedOrders, 
                        BigDecimal averageOrderValue) {
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.pendingOrders = pendingOrders;
        this.preparingOrders = preparingOrders;
        this.readyOrders = readyOrders;
        this.completedOrders = completedOrders;
        this.averageOrderValue = averageOrderValue;
    }
    
    // Getters et Setters
    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
    
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public Long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(Long pendingOrders) { this.pendingOrders = pendingOrders; }
    
    public Long getPreparingOrders() { return preparingOrders; }
    public void setPreparingOrders(Long preparingOrders) { this.preparingOrders = preparingOrders; }
    
    public Long getReadyOrders() { return readyOrders; }
    public void setReadyOrders(Long readyOrders) { this.readyOrders = readyOrders; }
    
    public Long getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(Long completedOrders) { this.completedOrders = completedOrders; }
    
    public BigDecimal getAverageOrderValue() { return averageOrderValue; }
    public void setAverageOrderValue(BigDecimal averageOrderValue) { this.averageOrderValue = averageOrderValue; }
}