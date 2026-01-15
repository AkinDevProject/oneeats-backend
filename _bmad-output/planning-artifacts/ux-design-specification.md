---
stepsCompleted: [1, 2]
inputDocuments:
  - docs/business/MOBILE_UI_SPECIFICATIONS.md
  - docs/product/prd.md
  - docs/business/USE_CASES.md
workflowType: 'ux-design'
targetPlatform: 'mobile'
projectName: 'OneEats'
---

# UX Design Specification - OneEats Mobile App

**Auteur:** Akin_
**Date:** 2026-01-15
**Focus:** Amélioration UX de l'application mobile client pour le MVP

---

## 1. Diagnostic UX Actuel

### 1.1 Structure de Navigation Actuelle

L'app utilise actuellement **4 onglets** dans la Tab Bar :

| Tab | Nom | Icône | Contenu |
|-----|-----|-------|---------|
| 1 | Restaurants | house | Liste restaurants + recherche + filtres |
| 2 | Mes Commandes | bag | Panier + Commandes en cours + Historique (3 sous-onglets) |
| 3 | Favoris | favorite | Liste des restaurants favoris |
| 4 | Mon Compte | person | Profil + Paramètres + Support |

### 1.2 Problèmes UX Identifiés

#### ❌ Problème 1: Confusion "Mes Commandes"
L'onglet "Mes Commandes" mélange deux concepts différents :
- **Panier** (pré-commande) : Articles à commander
- **Commandes** (post-commande) : Suivi des commandes passées

**Impact utilisateur** : L'utilisateur ne sait pas intuitivement où trouver son panier vs ses commandes.

#### ❌ Problème 2: "Favoris" en position privilégiée
L'onglet Favoris occupe une place prime dans la navigation (position 3/4).

**Impact utilisateur** :
- Fonctionnalité secondaire pour un MVP
- Espace précieux dans la Tab Bar non optimisé
- L'utilisateur doit naviguer vers un onglet dédié juste pour voir ses favoris

#### ❌ Problème 3: Flux utilisateur fragmenté
Le parcours utilisateur manque de fluidité :
1. Découverte → Restaurants (OK)
2. Ajout au panier → Restaurant detail (OK)
3. Consultation panier → "Mes Commandes" → sous-onglet "Panier" (friction)
4. Suivi commande → "Mes Commandes" → sous-onglet "En cours" (friction)

**Impact** : Trop de clics pour les actions fréquentes.

#### ❌ Problème 4: Manque de feedback global
- Pas d'indicateur visuel clair du panier global (badge présent mais mélangé avec commandes)
- Pas de notification proéminente pour commandes prêtes

---

## 2. Proposition de Refonte UX

### 2.1 Nouvelle Architecture de Navigation

**Passage de 4 tabs à 3 tabs** avec une meilleure organisation :

| Tab | Nom Proposé | Icône | Contenu |
|-----|-------------|-------|---------|
| 1 | **Accueil** | home | Découverte + Recherche + Favoris intégrés |
| 2 | **Panier** | shopping-cart | Panier uniquement (focus conversion) |
| 3 | **Compte** | person | Profil + Commandes + Favoris + Paramètres |

### 2.2 Rationalisation du Contenu

```
AVANT (4 tabs, contenu dispersé)            APRÈS (3 tabs, hiérarchie claire)
───────────────────────────────────         ─────────────────────────────────
┌─ Restaurants ─────────────────┐           ┌─ Accueil ───────────────────────┐
│  • Liste restaurants          │           │  • Section "Vos favoris" (top)  │
│  • Recherche                  │    →      │  • Liste restaurants            │
│  • Filtres                    │           │  • Recherche + Filtres          │
└───────────────────────────────┘           │  • Catégories                   │
                                            └─────────────────────────────────┘
┌─ Mes Commandes ───────────────┐
│  • Onglet Panier              │           ┌─ Panier ────────────────────────┐
│  • Onglet En cours            │    →      │  • Articles (liste simple)      │
│  • Onglet Historique          │           │  • Résumé + Heure de retrait    │
└───────────────────────────────┘           │  • CTA Commander                │
                                            │  • Lien "Voir mes commandes →"  │
┌─ Favoris ─────────────────────┐           └─────────────────────────────────┘
│  • Liste restaurants favoris  │    →      (Intégré à Accueil + Compte)
└───────────────────────────────┘
                                            ┌─ Compte ────────────────────────┐
┌─ Mon Compte ──────────────────┐           │  • Profil utilisateur           │
│  • Profil                     │    →      │  • Mes Commandes (avec onglets) │
│  • Paramètres                 │           │  • Mes Favoris                  │
│  • Support                    │           │  • Paramètres + Support         │
└───────────────────────────────┘           └─────────────────────────────────┘
```

### 2.3 Détail des Écrans Refondus

#### 📱 Écran 1: Accueil (Home)

**Objectif** : Découverte et accès rapide aux favoris

```
┌────────────────────────────────┐
│ 🍽 OneEats         📍 Paris   🔔│  ← Header avec localisation
├────────────────────────────────┤
│ 🔍 Rechercher un restaurant... │  ← Barre de recherche
├────────────────────────────────┤
│ [Filtres] [Tri] [Ouvert]       │  ← Chips filtres rapides
├────────────────────────────────┤
│ ❤️ VOS FAVORIS                 │  ← Section favoris (si connecté)
│ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │ R1  │ │ R2  │ │ +   │       │  ← Carousel horizontal
│ └─────┘ └─────┘ └─────┘       │
├────────────────────────────────┤
│ 🍕🍔🍜🥗🍰                      │  ← Catégories (chips scrollables)
├────────────────────────────────┤
│ RESTAURANTS PRÈS DE VOUS       │
│ ┌──────────────────────────┐  │
│ │ [Image]                  │  │  ← Card restaurant
│ │ Nom • ⭐ 4.5 • 15-20 min │  │
│ │ Type cuisine • 1.2 km    │  │
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ ...                      │  │
└────────────────────────────────┘
```

**Améliorations clés** :
- Favoris visibles immédiatement (pas besoin d'aller sur un onglet dédié)
- Recherche et filtres au-dessus du contenu
- Un seul scroll pour découvrir

---

#### 📱 Écran 2: Panier (Cart)

**Objectif** : Conversion maximale - focus sur la finalisation de commande

```
┌────────────────────────────────┐
│ ← Votre Panier                 │  ← Header simple
├────────────────────────────────┤
│ 📍 Restaurant La Bella Italia  │  ← Restaurant source
├────────────────────────────────┤
│ ┌──────────────────────────┐  │
│ │ 2x Pizza Margherita      │  │
│ │    Supplément mozzarella │  │  ← Items avec - / + / 🗑
│ │ [-] 2 [+]        25.80€ │  │
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ 1x Tiramisu              │  │
│ │ [-] 1 [+]         7.50€ │  │
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ 📝 Instructions (optionnel)    │  ← Champ notes
├────────────────────────────────┤
│ ⏰ HEURE DE RETRAIT            │
│ [12:30] [12:45] [13:00] [+]    │  ← Sélection horaire
├────────────────────────────────┤
│ RÉCAPITULATIF                  │
│ Sous-total ........... 33.30€  │
│ ─────────────────────────────  │
│ TOTAL ............... 33.30€   │
├────────────────────────────────┤
│ [====== COMMANDER ======]      │  ← CTA principal
├────────────────────────────────┤
│ Voir mes commandes →           │  ← Lien vers historique
└────────────────────────────────┘
```

**Améliorations clés** :
- Écran dédié au panier (pas de sous-onglets)
- Actions rapides sur les quantités
- CTA "Commander" toujours visible
- Lien discret vers l'historique

**État vide** :
```
┌────────────────────────────────┐
│       🛒                       │
│   Votre panier est vide        │
│                                │
│   Explorez les restaurants     │
│   et ajoutez vos plats         │
│   préférés !                   │
│                                │
│   [Découvrir les restaurants]  │
└────────────────────────────────┘
```

---

#### 📱 Écran 3: Compte (Account)

**Objectif** : Hub personnel complet avec accès aux commandes

```
┌────────────────────────────────┐
│ MON COMPTE                     │
├────────────────────────────────┤
│ ┌──────────────────────────┐  │
│ │ 👤 Jean Dupont           │  │
│ │    jean@email.com        │  │  ← Card profil
│ │    12 commandes • ⭐ 4.8  │  │
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ 📦 MES COMMANDES              │
│ ┌──────────────────────────┐  │
│ │ ⏳ En cours (1)          │→ │  ← Badge si commande active
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ 📋 Historique            │→ │
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ ❤️ MES FAVORIS               │
│ ┌──────────────────────────┐  │
│ │ Voir mes restaurants     │→ │  ← Accès liste favoris
│ │ favoris (4)              │  │
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ ⚙️ PARAMÈTRES                 │
│ ┌──────────────────────────┐  │
│ │ Profil personnel         │→ │
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ Paramètres app           │→ │
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ Aide & Support           │→ │
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ [Se déconnecter]               │
├────────────────────────────────┤
│ OneEats v1.0.0                 │
└────────────────────────────────┘
```

**Améliorations clés** :
- Commandes accessibles depuis le compte (pas dispersées)
- Favoris intégrés (lien vers la liste complète)
- Organisation claire par sections

---

#### 📱 Écran 4: Mes Commandes (Orders List)

**Objectif** : Vue unifiée des commandes (depuis l'écran Compte)

```
┌────────────────────────────────┐
│ ← Mes Commandes                │
├────────────────────────────────┤
│ [En cours] [Historique]        │  ← 2 onglets seulement
├────────────────────────────────┤
│ AUJOURD'HUI                    │
│ ┌──────────────────────────┐  │
│ │ 🟢 En préparation        │  │  ← Statut coloré
│ │ La Bella Italia          │  │
│ │ 2 articles • 33.30€      │  │
│ │ Retrait: 12:45           │  │
│ │ ─────────────────────    │  │
│ │ ▓▓▓▓▓▓░░░░ Prêt ~10 min  │  │  ← Progress bar
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ CETTE SEMAINE                  │
│ ┌──────────────────────────┐  │
│ │ ✅ Récupérée             │  │
│ │ Sushi Master • Lun 13/01 │  │
│ │ 3 articles • 28.50€      │  │
│ └──────────────────────────┘  │
└────────────────────────────────┘
```

---

## 3. Plan d'Implémentation Étape par Étape

### Phase 1: Restructuration Navigation (Priorité Haute)

#### Étape 1.1: Modifier la Tab Bar
**Fichier** : `apps/mobile/app/(tabs)/_layout.tsx`

**Actions** :
1. Réduire de 4 à 3 onglets
2. Renommer les onglets :
   - `index` → "Accueil" (icône: home)
   - `cart` → "Panier" (icône: shopping-cart)
   - `profile` → "Compte" (icône: person)
3. Supprimer l'onglet `favorites` de la Tab Bar

**Code à modifier** :
```tsx
// Supprimer l'import et le Tabs.Screen de favorites
// Changer les titres et icônes
```

---

#### Étape 1.2: Simplifier l'écran Panier
**Fichier** : `apps/mobile/app/(tabs)/cart.tsx`

**Actions** :
1. Supprimer les 3 sous-onglets (cart, current, history)
2. Garder uniquement la logique panier
3. Ajouter un lien "Voir mes commandes" en bas
4. Améliorer l'état vide

**Avant** : 909 lignes avec 3 onglets
**Après** : ~400 lignes focalisées sur le panier

---

#### Étape 1.3: Enrichir l'écran Compte
**Fichier** : `apps/mobile/app/(tabs)/profile.tsx`

**Actions** :
1. Ajouter la section "Mes Commandes" avec lien vers la liste
2. Ajouter la section "Mes Favoris" avec compteur
3. Réorganiser les éléments existants

---

### Phase 2: Création/Déplacement des Écrans (Priorité Moyenne)

#### Étape 2.1: Créer l'écran Commandes dédié
**Nouveau fichier** : `apps/mobile/app/orders/index.tsx`

**Actions** :
1. Créer un écran avec 2 onglets (En cours / Historique)
2. Récupérer la logique des sous-onglets de l'ancien cart.tsx
3. Navigation depuis le profil

---

#### Étape 2.2: Adapter l'écran Favoris
**Fichier** : `apps/mobile/app/(tabs)/favorites.tsx` → `apps/mobile/app/favorites/index.tsx`

**Actions** :
1. Déplacer le fichier hors de (tabs)
2. Rendre accessible depuis Accueil et Compte
3. Garder la logique existante

---

### Phase 3: Amélioration Écran Accueil (Priorité Moyenne)

#### Étape 3.1: Intégrer les Favoris dans l'Accueil
**Fichier** : `apps/mobile/app/(tabs)/index.tsx`

**Actions** :
1. Ajouter une section "Vos Favoris" en haut (carousel horizontal)
2. Conditionner l'affichage si l'utilisateur est connecté et a des favoris
3. Lien "Voir tous" vers la page favoris complète

---

### Phase 4: Finitions UX (Priorité Basse)

#### Étape 4.1: États vides cohérents
**Tous les écrans concernés**

**Actions** :
- Panier vide : illustration + CTA découverte
- Commandes vides : illustration + CTA premier achat
- Favoris vides : illustration + CTA découverte

---

#### Étape 4.2: Micro-animations
**Fichiers** : Tous les écrans

**Actions** :
- Transition douce entre les écrans
- Animation d'ajout au panier
- Pulse sur le badge panier

---

## 4. Checklist d'Implémentation

### Sprint 1 - Navigation Core

- [ ] **1.1** Modifier `_layout.tsx` - Passer à 3 tabs
- [ ] **1.2** Simplifier `cart.tsx` - Supprimer sous-onglets
- [ ] **1.3** Enrichir `profile.tsx` - Ajouter sections Commandes/Favoris
- [ ] **1.4** Créer `orders/index.tsx` - Écran commandes dédié

### Sprint 2 - Intégration Favoris

- [ ] **2.1** Déplacer `favorites.tsx` hors de (tabs)
- [ ] **2.2** Ajouter section favoris dans `index.tsx` (Accueil)
- [ ] **2.3** Ajouter navigation depuis Compte vers Favoris

### Sprint 3 - Finitions

- [ ] **3.1** Créer états vides cohérents
- [ ] **3.2** Ajouter animations de transition
- [ ] **3.3** Tester sur iOS et Android
- [ ] **3.4** Validation utilisateur

---

## 5. Métriques de Succès

| Métrique | Avant | Objectif |
|----------|-------|----------|
| Clics pour accéder au panier | 1-2 | 1 |
| Clics pour voir une commande | 2-3 | 2 |
| Temps moyen de checkout | N/A | -20% |
| Confusion navigation (retours utilisateurs) | Élevée | Faible |

---

## 6. Notes de Développement

### Fichiers à Modifier

| Fichier | Modification | Complexité |
|---------|-------------|------------|
| `app/(tabs)/_layout.tsx` | Restructuration tabs | Moyenne |
| `app/(tabs)/cart.tsx` | Simplification majeure | Élevée |
| `app/(tabs)/profile.tsx` | Ajout sections | Moyenne |
| `app/(tabs)/index.tsx` | Intégration favoris | Moyenne |
| `app/(tabs)/favorites.tsx` | Déplacement | Faible |
| `app/orders/index.tsx` | Nouveau fichier | Moyenne |

### Dépendances

- Les contextes existants (CartContext, OrderContext, FavoritesContext) restent inchangés
- Seule la présentation et navigation changent

---

## 7. Wireframes de Référence

Les wireframes ASCII ci-dessus servent de référence pour l'implémentation.
Pour des maquettes haute-fidélité, consulter Figma (à créer si nécessaire).

---

**Document créé le** : 2026-01-15
**Dernière mise à jour** : 2026-01-15
**Statut** : Prêt pour implémentation
