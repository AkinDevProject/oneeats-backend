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

    public void activate() {
        if (this.status == RestaurantStatus.ACTIVE) {
            throw new IllegalStateException("Restaurant is already active");
        }
        this.status = RestaurantStatus.ACTIVE;
        this.markAsModified();
    }

    public void open() {
        if (this.status != RestaurantStatus.ACTIVE) {
            throw new IllegalStateException("Cannot open inactive restaurant");
        }
        if (this.status == RestaurantStatus.OPEN) {
            throw new IllegalStateException("Restaurant is already open");
        }
        this.status = RestaurantStatus.OPEN;
        this.addDomainEvent(new RestaurantOpenedEvent(this.getId(), this.getName()));
        this.markAsModified();
    }

    public void close() {
        if (this.status != RestaurantStatus.OPEN) {
            throw new IllegalStateException("Restaurant is not open");
        }
        this.status = RestaurantStatus.ACTIVE;
        this.addDomainEvent(new RestaurantClosedEvent(this.getId(), this.getName()));
        this.markAsModified();
    }

    public void suspend() {
        this.status = RestaurantStatus.SUSPENDED;
        this.markAsModified();
    }

    public void updateRating(double newRating) {
        if (newRating < 0.0 || newRating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
        this.rating = newRating;
        this.markAsModified();
    }

    public boolean canAcceptOrders() {
        return this.status == RestaurantStatus.OPEN;
    }

    public boolean isActive() {
        return this.status == RestaurantStatus.ACTIVE || this.status == RestaurantStatus.OPEN;
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

    public void setImageUrl(String imageUrl) { 
        this.imageUrl = imageUrl; 
        this.markAsModified();
    }
}