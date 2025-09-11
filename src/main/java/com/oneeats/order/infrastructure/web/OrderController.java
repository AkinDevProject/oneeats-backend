package com.oneeats.order.infrastructure.web;

import com.oneeats.order.application.command.CreateOrderCommand;
import com.oneeats.order.application.command.CreateOrderCommandHandler;
import com.oneeats.order.application.dto.OrderDTO;
import com.oneeats.order.application.query.GetOrderQuery;
import com.oneeats.order.application.query.GetOrderQueryHandler;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.UUID;

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderController {

    @Inject
    CreateOrderCommandHandler createOrderCommandHandler;

    @Inject
    GetOrderQueryHandler getOrderQueryHandler;

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
}