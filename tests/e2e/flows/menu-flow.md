# Flow Cross-Platform : Gestion du Menu

## Objectif
Tester la synchronisation du menu entre le dashboard restaurant (création/modification) et l'application mobile (consultation).

---

## Prérequis

- Backend démarré : `http://localhost:8080`
- Base de données initialisée
- Émulateur Android démarré
- Comptes de test :
  - Client : `test.client@oneeats.com` / `Test123!`
  - Restaurant : `restaurant@oneeats.com` / `Test123!`

---

## Scénario 1 : Ajout d'un nouveau plat

### Phase 1 : Création (Web)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 1.1 | Connexion dashboard restaurant | Dashboard visible | Playwright |
| 1.2 | Naviguer vers "Menu" | Liste des plats | Playwright |
| 1.3 | Cliquer "Nouveau plat" | Formulaire ouvert | Playwright |
| 1.4 | Remplir : Nom="Test Plat UAT", Prix=15.00 | Champs remplis | Playwright |
| 1.5 | Sélectionner catégorie "Plats" | Catégorie sélectionnée | Playwright |
| 1.6 | Sauvegarder | Plat créé, visible dans liste | Playwright |

### Phase 2 : Vérification (Mobile)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 2.1 | Connexion app mobile | Dashboard client | Maestro |
| 2.2 | Sélectionner le restaurant | Menu affiché | Maestro |
| 2.3 | Chercher "Test Plat UAT" | Plat visible | Maestro |
| 2.4 | Vérifier prix | Prix = 15,00 € | Maestro |
| 2.5 | Ajouter au panier | Ajout réussi | Maestro |

---

## Scénario 2 : Modification de prix

### Phase 1 : Modification (Web)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 1.1 | Trouver "Test Plat UAT" | Plat visible | Playwright |
| 1.2 | Cliquer "Modifier" | Formulaire ouvert | Playwright |
| 1.3 | Changer prix à 18.50 | Champ modifié | Playwright |
| 1.4 | Sauvegarder | Nouveau prix affiché | Playwright |

### Phase 2 : Vérification (Mobile)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 2.1 | Rafraîchir le menu | Pull-to-refresh | Maestro |
| 2.2 | Vérifier "Test Plat UAT" | Prix = 18,50 € | Maestro |

---

## Scénario 3 : Désactivation d'un plat

### Phase 1 : Désactivation (Web)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 1.1 | Trouver "Test Plat UAT" | Plat visible | Playwright |
| 1.2 | Toggle "Disponible" OFF | Statut = Indisponible | Playwright |

### Phase 2 : Vérification (Mobile)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 2.1 | Rafraîchir le menu | Pull-to-refresh | Maestro |
| 2.2 | Chercher "Test Plat UAT" | Plat grisé OU absent | Maestro |
| 2.3 | Essayer d'ajouter au panier | Action impossible | Maestro |

---

## Scénario 4 : Suppression (cleanup)

### Phase 1 : Suppression (Web)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 1.1 | Trouver "Test Plat UAT" | Plat visible | Playwright |
| 1.2 | Cliquer "Supprimer" | Modal confirmation | Playwright |
| 1.3 | Confirmer suppression | Plat retiré de la liste | Playwright |

### Phase 2 : Vérification (Mobile)

| # | Action | Vérification | Outil |
|---|--------|--------------|-------|
| 2.1 | Rafraîchir le menu | Pull-to-refresh | Maestro |
| 2.2 | Chercher "Test Plat UAT" | Plat introuvable | Maestro |

---

## Critères de succès

- [ ] Création visible sur mobile < 5 secondes
- [ ] Modification prix synchronisée
- [ ] Plat désactivé non commandable sur mobile
- [ ] Suppression effective sur les deux plateformes
- [ ] Aucune erreur console
- [ ] Images chargées correctement

---

## Bugs potentiels à surveiller

1. **Cache mobile** : Ancien prix affiché après modification
2. **Plat fantôme** : Plat supprimé encore visible sur mobile
3. **Image manquante** : Placeholder au lieu de l'image uploadée
4. **Catégorie vide** : Catégorie affichée même sans plats actifs
