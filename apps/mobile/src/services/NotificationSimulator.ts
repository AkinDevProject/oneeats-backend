// Service pour simuler les notifications pendant le développement
export class NotificationSimulator {
  private static listeners: Array<(notification: any) => void> = [];

  // Simuler une notification d'ordre
  static simulateOrderNotification(orderId: string, status: string, restaurantName: string) {
    console.log('🔔 Simulation notification:', { orderId, status, restaurantName });

    const notification = {
      type: 'order_status_update',
      orderId,
      status,
      restaurantName,
      title: `Commande ${orderId}`,
      message: `Votre commande chez ${restaurantName} est maintenant ${status}`,
      timestamp: Date.now(),
    };

    // Notifier tous les listeners
    this.listeners.forEach(listener => listener(notification));

    // Afficher une alerte pour simulation
    if (__DEV__) {
      setTimeout(() => {
        alert(`📱 NOTIFICATION SIMULÉE\n\n${notification.title}\n${notification.message}`);
      }, 1000);
    }
  }

  // S'abonner aux notifications simulées
  static addListener(callback: (notification: any) => void) {
    this.listeners.push(callback);

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Simuler différents types de notifications
  static simulateNotifications() {
    console.log('🧪 Démarrage simulation notifications...');

    // Notification après 3 secondes
    setTimeout(() => {
      this.simulateOrderNotification('ORD-123', 'en préparation', 'Pizza Palace');
    }, 3000);

    // Notification après 8 secondes
    setTimeout(() => {
      this.simulateOrderNotification('ORD-123', 'prête', 'Pizza Palace');
    }, 8000);

    // Notification après 15 secondes
    setTimeout(() => {
      this.simulateOrderNotification('ORD-123', 'en livraison', 'Pizza Palace');
    }, 15000);
  }
}