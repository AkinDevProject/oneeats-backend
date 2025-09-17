// This is just for reference - we need this class
// Should be in src/main/java/com/oneeats/order/infrastructure/web/
public class OrderStatusUpdateRequest {
    private String newStatus;

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
}