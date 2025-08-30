# Prompt pour Claude Code : Restructuration backend OneEats

## Objectif
Restructurer le backend Quarkus de OneEats pour améliorer la maintenabilité, la scalabilité et la testabilité, tout en respectant l’architecture hexagonale, DDD et CQRS existante.
Mettre à jour le fichier `contexte.md` avec cette nouvelle structure et les bonnes pratiques.

---

## 1. Architecture et modularité
- Séparer le backend en **modules par domaine** :

```
oneeats-backend/
├── admin/
├── user/
├── restaurant/
├── menu/
├── order/
└── notification/
```

- Chaque module contient :
  - `domain/internal` → entités + use cases + services métier
  - `domain/api` → DTOs + ports/queries/commands
  - `domain/adapter` → controllers REST, repository Panache, mapping DTO ↔ Entity
- Les modules doivent être **compilables indépendamment** pour faciliter CI/CD et tests.

---

## 2. Persistance et repositories
- Utiliser **PanacheRepository** pour tous les domaines (Quarkus native) plutôt que InMemory ou JpaRepository classique.
- Créer des méthodes spécifiques par domaine pour les requêtes fréquentes :
```java
List<Order> findByStatusAndRestaurantId(OrderStatus status, UUID restaurantId);
List<Restaurant> findByName(String name);
```

* Préparer la migration des `InMemoryRepository` vers JPA/Hibernate pour le MVP.

---

## 3. Logique métier et CQRS

* Séparer clairement :

  * **Use Cases** : logique métier principale
  * **Domain Services** : règles métier complexes (ex: validation de commandes, calcul temps préparation)
* Ajouter une **state machine** ou enum enrichi pour les statuts de commande :

  ```
  En attente → En préparation → Prête → Récupérée → Annulée
  ```

  → validation stricte des transitions
* CQRS : séparer read model (pour dashboard/admin) et write model (commande).

---

## 4. Notifications et événements

* Passer les notifications en **event-driven** :

  * Chaque action métier importante émet un événement (ex: `OrderCreated`, `OrderStatusChanged`)
  * Les listeners mettent à jour notifications, read model ou statistiques
* Découpler la persistance des notifications du déclenchement d’événements pour scalabilité future.

---

## 5. Sécurité et authentification

* Intégration **Keycloak** pour tous les utilisateurs (clients, restaurants, admins)
* Utiliser JWT pour sécuriser les endpoints REST OIDC
* Externaliser les rôles dans Keycloak, ne pas hardcoder
* Prévoir un **audit log** pour toutes les actions critiques (admin, restaurant)

---

## 6. Tests et qualité

* Créer tests unitaires par **domaine** pour tous les use cases
* Créer tests d’intégration avec Docker Compose + PostgreSQL
* Couverture Jacoco pour mesurer qualité du code
* Tests de flux métier critiques (commande → notification → statut → lecture client)

---

## 7. Optimisation future

* Caching pour requêtes fréquentes (menus, restaurants ouverts) via Quarkus Cache ou Redis
* Pagination et filtres pour recherches avancées
* Service média séparé pour upload et lecture d’images (plats, restaurants)

---

## 8. Exemple d’amélioration d’un domaine

```java
@ApplicationScoped
public class OrderService {
    public Order createOrder(User user, Restaurant restaurant, List<MenuItem> items) { ... }

    public void updateStatus(UUID orderId, OrderStatus newStatus) {
        Order order = repository.findById(orderId);
        if (!order.canTransitionTo(newStatus)) throw new IllegalStateException();
        order.setStatus(newStatus);
        eventPublisher.publish(new OrderStatusChangedEvent(order));
    }
}
```

---

## 9. Objectif pour Claude Code

1. **Restructurer le backend** en suivant les recommandations ci-dessus
2. **Migrer InMemoryRepository vers PanacheRepository**
3. **Créer méthodes utiles par domaine pour le MVP**
4. **Préparer l’architecture pour event-driven et notifications futures**
5. **Mettre à jour `contexte.md`** avec :

  * Nouvelle structure backend
  * Bonnes pratiques Panache / repositories
  * Event-driven notifications
  * Sécurité Keycloak/JWT
  * Tests et flux métier améliorés

