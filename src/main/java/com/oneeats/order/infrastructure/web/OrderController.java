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
import com.oneeats.security.Roles;
import com.oneeats.security.application.AuthService;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
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
    AuthService authService;

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
    @RolesAllowed(Roles.USER)
    public Response createOrder(@Valid CreateOrderCommand command) {
        OrderDTO order = createOrderCommandHandler.handle(command);
        return Response.status(Response.Status.CREATED).entity(order).build();
    }

    @GET
    @Path("/{id}")
    @Authenticated
    public Response getOrderById(@PathParam("id") UUID id) {
        // TODO: Verifier que l'utilisateur est le client, le restaurant ou admin
        OrderDTO order = getOrderQueryHandler.handle(new GetOrderQuery(id));
        return Response.ok(order).build();
    }

    @GET
    @Authenticated
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
            // Seul admin peut voir toutes les commandes
            if (!authService.hasRole(Roles.ADMIN)) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity("Acces reserve aux administrateurs")
                    .build();
            }
            orders = getAllOrdersQueryHandler.handle(new GetAllOrdersQuery());
        }
        // Get orders by restaurant
        else if (restaurantId != null) {
            // Verifier acces au restaurant (sauf admin)
            if (!authService.hasRole(Roles.ADMIN) && !authService.hasAccessToRestaurant(restaurantId)) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity("Acces refuse a ce restaurant")
                    .build();
            }
            orders = getOrdersByRestaurantQueryHandler.handle(
                new GetOrdersByRestaurantQuery(restaurantId));
        }
        // Get orders by user
        else if (userId != null) {
            // Verifier que c'est l'utilisateur courant ou admin
            if (!authService.hasRole(Roles.ADMIN) && !authService.isCurrentUser(userId)) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity("Acces refuse aux commandes d'un autre utilisateur")
                    .build();
            }
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
    @RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
    public Response updateOrderStatus(@PathParam("id") UUID orderId, OrderStatusUpdateRequest request) {
        // TODO: Verifier que la commande appartient au restaurant de l'utilisateur
        UpdateOrderStatusCommand command = new UpdateOrderStatusCommand(orderId, request.getNewStatus());
        OrderDTO updatedOrder = updateOrderStatusCommandHandler.handle(command);
        return Response.ok(updatedOrder).build();
    }
}