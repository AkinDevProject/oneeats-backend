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
    UpdateOrderStatusCommandHandler updateOrderStatusCommandHandler;

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
    public Response getOrdersByRestaurant(@QueryParam("restaurantId") UUID restaurantId) {
        if (restaurantId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("restaurantId parameter is required")
                .build();
        }
        
        List<OrderDTO> orders = getOrdersByRestaurantQueryHandler.handle(
            new GetOrdersByRestaurantQuery(restaurantId));
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