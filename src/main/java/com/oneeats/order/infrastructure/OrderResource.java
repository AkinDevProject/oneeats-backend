package com.oneeats.order.infrastructure;

import com.oneeats.order.api.CreateOrderRequest;
import com.oneeats.order.api.OrderDto;
import com.oneeats.order.api.UpdateOrderStatusRequest;
import com.oneeats.order.domain.Order;
import com.oneeats.order.domain.OrderService;
import com.oneeats.order.domain.OrderStatus;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour les commandes
 * Endpoints : /api/orders
 */
@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderResource {
    
    private static final Logger LOG = Logger.getLogger(OrderResource.class);
    
    @Inject
    OrderService orderService;
    
    @Inject
    OrderRepository orderRepository;
    
    @Inject
    OrderMapper orderMapper;
    
    /**
     * Créer une nouvelle commande
     * POST /api/orders
     */
    @POST
    public Response createOrder(@Valid CreateOrderRequest request, 
                               @HeaderParam("User-Id") UUID userId) {
        
        if (userId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Header User-Id requis")
                .build();
        }
        
        LOG.infof("Création d'une commande pour l'utilisateur %s", userId);
        
        try {
            // Convertir la requête en entité
            Order order = orderMapper.fromCreateRequest(request, userId);
            
            // Créer via le service métier
            Order createdOrder = orderService.createOrder(
                userId, 
                request.restaurantId(), 
                order.getTotalAmount(), 
                request.specialInstructions()
            );
            
            // Ajouter les items
            request.items().forEach(itemRequest -> {
                var item = orderMapper.fromCreateItemRequest(itemRequest);
                orderService.addItemToOrder(createdOrder.getId(), item);
            });
            
            // Retourner le DTO
            OrderDto orderDto = orderMapper.toDto(createdOrder);
            return Response.status(Response.Status.CREATED)
                .entity(orderDto)
                .build();
                
        } catch (Exception e) {
            LOG.errorf(e, "Erreur lors de la création de la commande: %s", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Erreur lors de la création de la commande")
                .build();
        }
    }
    
    /**
     * Obtenir une commande par ID
     * GET /api/orders/{id}
     */
    @GET
    @Path("/{id}")
    public Response getOrder(@PathParam("id") UUID orderId) {
        LOG.debugf("Récupération de la commande %s", orderId);
        
        Order order = orderRepository.findByIdEager(orderId);
        if (order == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        OrderDto orderDto = orderMapper.toDto(order);
        return Response.ok(orderDto).build();
    }
    
    /**
     * Lister les commandes d'un utilisateur
     * GET /api/orders?userId={userId}
     */
    @GET
    public Response getOrders(@QueryParam("userId") UUID userId,
                             @QueryParam("restaurantId") UUID restaurantId,
                             @QueryParam("status") OrderStatus status,
                             @QueryParam("page") @DefaultValue("0") int page,
                             @QueryParam("size") @DefaultValue("20") int size) {
        
        LOG.debugf("Récupération des commandes - userId=%s, restaurantId=%s, status=%s", 
                  userId, restaurantId, status);
        
        List<Order> orders;
        
        if (userId != null) {
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else if (restaurantId != null && status != null) {
            orders = orderRepository.findByRestaurantIdAndStatus(restaurantId, status);
        } else if (restaurantId != null) {
            orders = orderRepository.findByRestaurantId(restaurantId);
        } else {
            // Administration - toutes les commandes avec pagination
            orders = orderRepository.findWithPagination(page, size, 
                io.quarkus.panache.common.Sort.by("createdAt").descending());
        }
        
        List<OrderDto> orderDtos = orderMapper.toSummaryDtoList(orders);
        return Response.ok(orderDtos).build();
    }
    
    /**
     * Mettre à jour le statut d'une commande
     * PUT /api/orders/{id}/status
     */
    @PUT
    @Path("/{id}/status")
    public Response updateOrderStatus(@PathParam("id") UUID orderId,
                                     @Valid UpdateOrderStatusRequest request) {
        
        LOG.infof("Mise à jour du statut de la commande %s vers %s", orderId, request.newStatus());
        
        try {
            Order updatedOrder;
            if (request.newStatus() == OrderStatus.ANNULEE && request.reason() != null) {
                orderService.cancelOrder(orderId, request.reason());
                updatedOrder = orderRepository.findByIdEager(orderId);
            } else {
                updatedOrder = orderService.updateOrderStatus(orderId, request.newStatus());
            }
            
            // Retourner la commande mise à jour
            OrderDto orderDto = orderMapper.toDto(updatedOrder);
            return Response.ok(orderDto).build();
            
        } catch (OrderService.OrderNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity("Commande non trouvée")
                .build();
        } catch (IllegalStateException | IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(e.getMessage())
                .build();
        } catch (Exception e) {
            LOG.errorf(e, "Erreur lors de la mise à jour du statut: %s", e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Erreur lors de la mise à jour: " + e.getMessage())
                .build();
        }
    }
    
    /**
     * Actions rapides sur les commandes
     */
    
    @PUT
    @Path("/{id}/confirm")
    public Response confirmOrder(@PathParam("id") UUID orderId) {
        return updateOrderStatus(orderId, new UpdateOrderStatusRequest(OrderStatus.EN_PREPARATION, null));
    }
    
    @PUT
    @Path("/{id}/ready")
    public Response markOrderReady(@PathParam("id") UUID orderId,
                                  @QueryParam("pickupMinutes") @DefaultValue("5") int pickupMinutes) {
        try {
            orderService.markOrderReady(orderId, pickupMinutes);
            Order order = orderRepository.findByIdEager(orderId);
            return Response.ok(orderMapper.toDto(order)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(e.getMessage())
                .build();
        }
    }
    
    @PUT
    @Path("/{id}/pickup")
    public Response markOrderPickedUp(@PathParam("id") UUID orderId) {
        return updateOrderStatus(orderId, new UpdateOrderStatusRequest(OrderStatus.RECUPEREE, null));
    }
    
    @PUT
    @Path("/{id}/cancel")
    public Response cancelOrder(@PathParam("id") UUID orderId,
                               @QueryParam("reason") String reason) {
        return updateOrderStatus(orderId, new UpdateOrderStatusRequest(OrderStatus.ANNULEE, reason));
    }
    
    /**
     * Statistiques pour les restaurants
     * GET /api/orders/restaurant/{id}/stats
     */
    @GET
    @Path("/restaurant/{id}/stats")
    public Response getRestaurantStats(@PathParam("id") UUID restaurantId) {
        try {
            long todayOrders = orderRepository.countTodayOrdersByRestaurant(restaurantId);
            long activeOrders = orderRepository.countByRestaurantIdAndStatus(restaurantId, OrderStatus.EN_PREPARATION);
            List<Order> overdueOrders = orderService.findOverdueOrders(restaurantId, 30);
            
            var stats = new RestaurantStats(todayOrders, activeOrders, overdueOrders.size());
            return Response.ok(stats).build();
            
        } catch (Exception e) {
            LOG.errorf(e, "Erreur lors du calcul des statistiques: %s", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Statistiques détaillées pour le dashboard
     * GET /api/orders/restaurant/{id}/stats/today
     */
    @GET
    @Path("/restaurant/{id}/stats/today")
    public Response getTodayDetailedStats(@PathParam("id") UUID restaurantId) {
        try {
            long totalOrders = orderRepository.countTodayOrdersByRestaurant(restaurantId);
            long pendingOrders = orderRepository.countByRestaurantIdAndStatus(restaurantId, OrderStatus.EN_ATTENTE);
            long preparingOrders = orderRepository.countByRestaurantIdAndStatus(restaurantId, OrderStatus.EN_PREPARATION);
            long readyOrders = orderRepository.countByRestaurantIdAndStatus(restaurantId, OrderStatus.PRETE);
            long deliveredOrders = orderRepository.countByRestaurantIdAndStatus(restaurantId, OrderStatus.RECUPEREE);
            
            // Calculer un faux chiffre d'affaires pour le mock (à remplacer par vraie logique)
            double mockRevenue = totalOrders * 23.50; // Prix moyen fictif
            double avgOrderValue = totalOrders > 0 ? mockRevenue / totalOrders : 0.0;
            
            var detailedStats = new DetailedRestaurantStats(
                totalOrders, pendingOrders, preparingOrders, readyOrders, 
                deliveredOrders, mockRevenue, avgOrderValue
            );
            return Response.ok(detailedStats).build();
            
        } catch (Exception e) {
            LOG.errorf(e, "Erreur lors du calcul des statistiques détaillées: %s", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtenir les commandes en attente d'un restaurant
     * GET /api/orders/restaurant/{id}/pending
     */
    @GET
    @Path("/restaurant/{id}/pending")
    public Response getPendingOrders(@PathParam("id") UUID restaurantId) {
        List<Order> pendingOrders = orderRepository.findByRestaurantIdAndStatus(restaurantId, OrderStatus.EN_ATTENTE);
        List<OrderDto> orderDtos = orderMapper.toSummaryDtoList(pendingOrders);
        return Response.ok(orderDtos).build();
    }
    
    /**
     * Record pour les statistiques restaurant
     */
    public record RestaurantStats(
        long ordersToday,
        long activeOrders,
        long overdueOrders
    ) {}
    
    /**
     * Record pour les statistiques détaillées
     */
    public record DetailedRestaurantStats(
        long total,
        long pending,
        long preparing,
        long ready,
        long delivered,
        double revenue,
        double avgOrderValue
    ) {}
}