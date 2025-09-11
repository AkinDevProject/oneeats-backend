package com.oneeats.order.domain.service;

import com.oneeats.order.domain.repository.IOrderRepository;
import com.oneeats.shared.domain.exception.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@ApplicationScoped
public class OrderDomainService {

    @Inject
    IOrderRepository orderRepository;

    public String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int randomNum = ThreadLocalRandom.current().nextInt(100, 999);
        String orderNumber = "ORD-" + timestamp + "-" + randomNum;
        
        if (orderRepository.existsByOrderNumber(orderNumber)) {
            return generateOrderNumber();
        }
        
        return orderNumber;
    }

    public void validateOrderCreation(String orderNumber) {
        if (orderNumber == null || orderNumber.trim().isEmpty()) {
            throw new ValidationException("Order number cannot be empty");
        }

        if (orderRepository.existsByOrderNumber(orderNumber)) {
            throw new ValidationException("Order with this number already exists");
        }
    }
}