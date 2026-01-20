# Flow Cross-Platform : Création et Traitement de Commande

## Objectif
Tester le parcours complet d'une commande depuis sa création sur mobile jusqu'à sa prise en charge sur le dashboard restaurant.

---

## Prérequis

- Backend démarré : `http://localhost:8080`
- Base de données initialisée avec données de test
- Émulateur Android démarré
- Comptes de test :
  - Client : `test.client@oneeats.com` / `Test123!`
  - Restaurant : `restaurant@oneeats.com` / `Test123!`

---

## Étapes du Flow

### Phase 1 : Création de commande (Mobile)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 1.1 | Ouvrir l'app mobile | Écran de connexion visible | Maestro |
| 1.2 | Se connecter en tant que client | Dashboard client visible | Maestro |
| 1.3 | Sélectionner "Le Petit Bistrot" | Page restaurant affichée | Maestro |
| 1.4 | Ajouter "Burger Classic" au panier | Badge panier = 1 | Maestro |
| 1.5 | Ajouter "Frites" au panier | Badge panier = 2 | Maestro |
| 1.6 | Ouvrir le panier | Total affiché correctement | Maestro |
| 1.7 | Valider la commande | Numéro de commande généré | Maestro |
| 1.8 | **Noter le numéro de commande** | Pour vérification web | Manuel |

### Phase 2 : Réception de commande (Web)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 2.1 | Ouvrir le dashboard restaurant | Page de connexion | Playwright |
| 2.2 | Se connecter en tant que restaurateur | Dashboard visible | Playwright |
| 2.3 | Aller dans "Commandes" | Liste des commandes | Playwright |
| 2.4 | Vérifier présence nouvelle commande | Commande avec bon numéro visible | Playwright |
| 2.5 | Vérifier détails (items, total) | Items correspondent | Playwright |
| 2.6 | Accepter la commande | Statut = "Acceptée" | Playwright |

### Phase 3 : Suivi de commande (Mobile)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 3.1 | Retour sur l'app mobile | App toujours ouverte | Maestro |
| 3.2 | Aller dans "Mes commandes" | Liste des commandes | Maestro |
| 3.3 | Sélectionner la commande | Détails affichés | Maestro |
| 3.4 | Vérifier statut mis à jour | Statut = "Acceptée" | Maestro |

### Phase 4 : Finalisation (Web + Mobile)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 4.1 | Web : Marquer commande "Prête" | Statut = "Prête" | Playwright |
| 4.2 | Mobile : Vérifier notification | Notification reçue | Maestro |
| 4.3 | Mobile : Statut mis à jour | Statut = "Prête à récupérer" | Maestro |
| 4.4 | Web : Marquer comme "Récupérée" | Statut = "Terminée" | Playwright |
| 4.5 | Mobile : Statut final | Statut = "Terminée" | Maestro |

---

## Scripts de test

### Mobile (Maestro)
```bash
# Exécuter dans l'ordre
maestro test tests/e2e/mobile/login.yaml
maestro test tests/e2e/mobile/order.yaml
```

### Web (Playwright)
```bash
npx playwright test tests/e2e/web/orders.spec.ts
```

---

## Critères de succès

- [ ] Commande créée avec succès sur mobile
- [ ] Commande visible sur dashboard dans les 5 secondes
- [ ] Items et total correspondent
- [ ] Changements de statut synchronisés entre plateformes
- [ ] Aucune erreur console (web et mobile)
- [ ] Temps de réponse API < 2 secondes

---

## Bugs potentiels à surveiller

1. **Synchronisation retardée** : Commande n'apparaît pas immédiatement
2. **Incohérence de prix** : Total différent mobile vs web
3. **Statut désynchronisé** : Mobile ne reflète pas les changements web
4. **Session expirée** : Déconnexion inattendue pendant le flow
