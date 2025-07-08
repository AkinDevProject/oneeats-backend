package com.oneeats.order.adapter.web;

import com.oneeats.order.api.cqrs.command.CreateOrderCommand;
import com.oneeats.order.api.cqrs.command.UpdateOrderCommand;
import com.oneeats.order.api.model.OrderDto;
import com.oneeats.order.internal.application.CreateOrderUseCase;
import com.oneeats.order.internal.application.UpdateOrderUseCase;
import com.oneeats.order.internal.application.GetOrderUseCase;
import com.oneeats.order.internal.application.GetAllOrdersUseCase;
import com.oneeats.order.internal.application.DeleteOrderUseCase;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderResource {
    @Inject
    CreateOrderUseCase createOrderUseCase;
    @Inject
    UpdateOrderUseCase updateOrderUseCase;
    @Inject
    GetOrderUseCase getOrderUseCase;
    @Inject
    GetAllOrdersUseCase getAllOrdersUseCase;
    @Inject
    DeleteOrderUseCase deleteOrderUseCase;

    @POST
    public Response createOrder(CreateOrderCommand command) {
        UUID id = createOrderUseCase.handle(command);
        return Response.status(Response.Status.CREATED).entity(id).build();
    }

    @PUT
    public Response updateOrder(UpdateOrderCommand command) {
        boolean updated = updateOrderUseCase.handle(command);
        if (updated) {
            return Response.ok().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getOrder(@PathParam("id") UUID id) {
        Optional<OrderDto> dto = getOrderUseCase.handle(id);
        return dto.map(Response::ok)
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND))
                .build();
    }

    @GET
    public List<OrderDto> getAllOrders() {
        return getAllOrdersUseCase.handle();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteOrder(@PathParam("id") UUID id) {
        boolean deleted = deleteOrderUseCase.handle(id);
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
}
