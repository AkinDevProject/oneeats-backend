package com.oneeats.order.infrastructure.web;

import com.oneeats.order.application.command.CreateOrderCommand;
import com.oneeats.order.application.command.CreateOrderCommandHandler;
import com.oneeats.order.application.command.UpdateOrderStatusCommand;
import com.oneeats.order.application.command.UpdateOrderStatusCommandHandler;
import com.oneeats.order.application.dto.OrderDTO;
import com.oneeats.order.application.query.GetOrderQuery;
import com.oneeats.order.application.query.GetOrderQueryHandler;
import com.oneeats.order.application.query.GetOrdersByRestaurantQuery;
import com.oneeats.order.application.query.GetOrdersByRestaurantQueryHandler;
import com.oneeats.order.application.query.GetOrdersByUserQuery;
import com.oneeats.order.application.query.GetOrdersByUserQueryHandler;
import com.oneeats.order.application.query.GetAllOrdersQuery;
import com.oneeats.order.application.query.GetAllOrdersQueryHandler;
import com.oneeats.order.domain.model.OrderStatus;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderController {

    @Inject
    CreateOrderCommandHandler createOrderCommandHandler;

    @Inject
    GetOrderQueryHandler getOrderQueryHandler;

    @Inject
    GetOrdersByRestaurantQueryHandler getOrdersByRestaurantQueryHandler;

    @Inject
    GetOrdersByUserQueryHandler getOrdersByUserQueryHandler;

    @Inject
    UpdateOrderStatusCommandHandler updateOrderStatusCommandHandler;

    @Inject
    GetAllOrdersQueryHandler getAllOrdersQueryHandler;

    @POST
    public Response createOrder(@Valid CreateOrderCommand command) {
        OrderDTO order = createOrderCommandHandler.handle(command);
        return Response.status(Response.Status.CREATED).entity(order).build();
    }

    @GET
    @Path("/{id}")
    public Response getOrderById(@PathParam("id") UUID id) {
        OrderDTO order = getOrderQueryHandler.handle(new GetOrderQuery(id));
        return Response.ok(order).build();
    }

    @GET
    public Response getOrders(@QueryParam("restaurantId") UUID restaurantId,
                             @QueryParam("userId") UUID userId,
                             @QueryParam("all") boolean allOrders) {
        if (restaurantId != null && userId != null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Cannot specify both restaurantId and userId parameters")
                .build();
        }

        List<OrderDTO> orders;

        // Admin endpoint to get all orders
        if (allOrders) {
            orders = getAllOrdersQueryHandler.handle(new GetAllOrdersQuery());
        }
        // Get orders by restaurant
        else if (restaurantId != null) {
            orders = getOrdersByRestaurantQueryHandler.handle(
                new GetOrdersByRestaurantQuery(restaurantId));
        }
        // Get orders by user
        else if (userId != null) {
            orders = getOrdersByUserQueryHandler.handle(
                new GetOrdersByUserQuery(userId));
        }
        // No valid parameters provided
        else {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Either restaurantId, userId parameter or all=true is required")
                .build();
        }

        return Response.ok(orders).build();
    }

    @PUT
    @Path("/{id}/status")
    public Response updateOrderStatus(@PathParam("id") UUID orderId, OrderStatusUpdateRequest request) {
        UpdateOrderStatusCommand command = new UpdateOrderStatusCommand(orderId, request.getNewStatus());
        OrderDTO updatedOrder = updateOrderStatusCommandHandler.handle(command);
        return Response.ok(updatedOrder).build();
    }
}