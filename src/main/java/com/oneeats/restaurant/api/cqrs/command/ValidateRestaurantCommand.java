package com.oneeats.restaurant.api.cqrs.command;

import java.util.UUID;
import com.oneeats.restaurant.internal.entity.Restaurant;

public class ValidateRestaurantCommand {
    private UUID restaurantId;
    private Restaurant.StatutValidation statutValidation;
    private String commentaire;

    public ValidateRestaurantCommand(UUID restaurantId, Restaurant.StatutValidation statutValidation, String commentaire) {
        this.restaurantId = restaurantId;
        this.statutValidation = statutValidation;
        this.commentaire = commentaire;
    }

    public UUID getRestaurantId() { return restaurantId; }
    public Restaurant.StatutValidation getStatutValidation() { return statutValidation; }
    public String getCommentaire() { return commentaire; }
}

