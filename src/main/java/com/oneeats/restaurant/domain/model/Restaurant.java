package com.oneeats.restaurant.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.restaurant.domain.event.RestaurantCreatedEvent;
import com.oneeats.restaurant.domain.event.RestaurantOpenedEvent;
import com.oneeats.restaurant.domain.event.RestaurantClosedEvent;

import java.util.UUID;

public class Restaurant extends BaseEntity {
    
    private String name;
    private String description;
    private String address;
    private String phone;
    private Email email;
    private String cuisineType;
    private Double rating;
    private String imageUrl;
    private RestaurantStatus status;
    private WeeklySchedule schedule;

    protected Restaurant() {}

    public Restaurant(UUID id, String name, String description, String address, String phone, 
                     Email email, String cuisineType, RestaurantStatus status) {
        super(id);
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.cuisineType = cuisineType;
        this.rating = 0.0;
        this.status = status;
        this.schedule = new WeeklySchedule();
    }

    public static Restaurant create(String name, String description, String address, 
                                  String phone, String email, String cuisineType) {
        Restaurant restaurant = new Restaurant(
            UUID.randomUUID(),
            name,
            description,
            address,
            phone,
            new Email(email),
            cuisineType,
            RestaurantStatus.PENDING
        );
        
        restaurant.addDomainEvent(new RestaurantCreatedEvent(
            restaurant.getId(),
            restaurant.getName(),
            restaurant.getEmail()
        ));
        
        return restaurant;
    }

    public void updateInfo(String name, String description, String address, String phone, String email) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.email = new Email(email);
        this.markAsModified();
    }

    public void updateSchedule(WeeklySchedule schedule) {
        this.schedule = schedule;
        this.markAsModified();
    }

    public void approve() {
        if (this.status == RestaurantStatus.APPROVED) {
            throw new IllegalStateException("Restaurant is already approved");
        }
        this.status = RestaurantStatus.APPROVED;
        this.markAsModified();
    }

    public void block() {
        this.status = RestaurantStatus.BLOCKED;
        this.markAsModified();
    }

    private boolean isOpen = false;

    public void open() {
        if (this.status != RestaurantStatus.APPROVED) {
            throw new IllegalStateException("Cannot open non-approved restaurant");
        }
        this.isOpen = true;
        this.addDomainEvent(new RestaurantOpenedEvent(this.getId(), this.getName()));
        this.markAsModified();
    }

    public void close() {
        if (!this.isOpen) {
            throw new IllegalStateException("Restaurant is not open");
        }
        this.isOpen = false;
        this.addDomainEvent(new RestaurantClosedEvent(this.getId(), this.getName()));
        this.markAsModified();
    }

    public void updateRating(double newRating) {
        if (newRating < 0.0 || newRating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
        this.rating = newRating;
        this.markAsModified();
    }

    public void updateStatus(RestaurantStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        this.status = newStatus;
        this.markAsModified();
    }

    public boolean canAcceptOrders() {
        // Un restaurant peut accepter des commandes s'il est APPROVED et isOpen
        return this.status == RestaurantStatus.APPROVED && this.isOpen;
    }

    public boolean isActive() {
        // Un restaurant est actif s'il est APPROVED (non bloqué, non en attente)
        return this.status == RestaurantStatus.APPROVED;
    }

    public boolean isOpen() {
        return this.isOpen;
    }

    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public Email getEmail() { return email; }
    public String getCuisineType() { return cuisineType; }
    public Double getRating() { return rating; }
    public String getImageUrl() { return imageUrl; }
    public RestaurantStatus getStatus() { return status; }
    public WeeklySchedule getSchedule() { return schedule; }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        this.markAsModified();
    }

    public void setIsOpen(boolean isOpen) {
        this.isOpen = isOpen;
        this.markAsModified();
    }
}