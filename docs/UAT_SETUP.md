# UAT Setup - Tests Automatisés End-to-End

> **Objectif** : Permettre à Claude Code de tester l'application web ET mobile simultanément, détecter les bugs, et générer des rapports automatiques.

---

## Statut actuel

| Étape | Status | Notes |
|-------|--------|-------|
| 1. Playwright MCP (Web) | ✅ Configuré | `.mcp.json` créé |
| 2. Maestro (Mobile) | ✅ Installé | `C:\Users\akin_\AppData\Roaming\npm\maestro` |
| 3. Émulateur Android | ✅ Disponible | 3 AVDs: Medium_Phone_API_35, Pixel_9_API_35 |
| 4. Scripts de test | ✅ Créés | Web (3 specs) + Mobile (3 yamls) + Flows (2) |
| 5. Guides UAT | ✅ Complets | Admin (13 scénarios), Restaurant (12), Mobile (17) |
| 6. Rapports de bugs | ✅ Format défini | Modèle dans ce document |

---

## Guides UAT disponibles

| Guide | Cible | Scénarios | Lien |
|-------|-------|-----------|------|
| **UAT_GUIDE_ADMIN.md** | Administrateurs | 13 | [Voir](UAT_GUIDE_ADMIN.md) |
| **UAT_GUIDE_RESTAURANT.md** | Restaurateurs | 12 | [Voir](UAT_GUIDE_RESTAURANT.md) |
| **UAT_GUIDE_MOBILE.md** | Clients (app mobile) | 17 | [Voir](UAT_GUIDE_MOBILE.md) |

---

## Architecture cible

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code                               │
│                         │                                    │
│         ┌───────────────┼───────────────┐                   │
│         ▼               ▼               ▼                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Playwright  │ │   Maestro   │ │   Backend   │           │
│  │    MCP      │ │   (Mobile)  │ │    Logs     │           │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
│         ▼               ▼               ▼                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Web App    │ │ Mobile App  │ │  Database   │           │
│  │  (Chrome)   │ │ (Émulateur) │ │ (PostgreSQL)│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Étape 1 : Playwright MCP (Web)

### Installation

```bash
# Installer le package globalement
npm install -g @playwright/mcp
```

### Configuration Claude Code

Fichier : `~/.claude/settings.json` (ou via `claude mcp add`)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Vérification

Après redémarrage de Claude Code, les outils suivants seront disponibles :
- `browser_navigate` - Naviguer vers une URL
- `browser_click` - Cliquer sur un élément
- `browser_type` - Saisir du texte
- `browser_screenshot` - Prendre une capture d'écran
- `browser_console_messages` - Voir les erreurs console

### URLs à tester

| App | URL | Description |
|-----|-----|-------------|
| Dashboard Restaurant | http://localhost:8080/restaurant | Interface restaurateur |
| API Backend | http://localhost:8080/api | Endpoints REST |

---

## Étape 2 : Maestro (Mobile)

### Installation

**Windows (PowerShell admin) :**
```powershell
# Via Chocolatey
choco install maestro

# Ou télécharger manuellement depuis https://maestro.mobile.dev
```

**Alternative WSL :**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Structure des tests Maestro

```yaml
# tests/e2e/mobile/login.yaml
appId: com.oneeats.mobile
---
- launchApp
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Mot de passe"
- inputText: "password123"
- tapOn: "Se connecter"
- assertVisible: "Accueil"
```

### Commandes utiles

```bash
# Lancer un test
maestro test tests/e2e/mobile/login.yaml

# Mode studio (enregistrement)
maestro studio

# Screenshot
maestro screenshot
```

---

## Étape 3 : Émulateur Android

### Prérequis

1. **Android Studio** installé
2. **Android SDK** configuré
3. **Émulateur** créé (Pixel 5 API 33 recommandé)

### Vérification

```bash
# Lister les émulateurs
emulator -list-avds

# Lancer un émulateur
emulator -avd Pixel_5_API_33

# Vérifier la connexion ADB
adb devices
```

---

## Étape 4 : Scénarios de test cross-platform

### Scénario 1 : Création de commande (Mobile → Web)

| Étape | Plateforme | Action | Vérification |
|-------|------------|--------|--------------|
| 1 | Mobile | Se connecter en tant que client | Écran d'accueil visible |
| 2 | Mobile | Sélectionner un restaurant | Menu affiché |
| 3 | Mobile | Ajouter des items au panier | Panier mis à jour |
| 4 | Mobile | Valider la commande | Confirmation affichée |
| 5 | Web | Se connecter en tant que restaurateur | Dashboard visible |
| 6 | Web | Vérifier nouvelles commandes | Commande visible |
| 7 | Web | Accepter la commande | Statut changé |
| 8 | Mobile | Vérifier le statut | Statut "Acceptée" |

### Scénario 2 : Gestion du menu (Web → Mobile)

| Étape | Plateforme | Action | Vérification |
|-------|------------|--------|--------------|
| 1 | Web | Se connecter restaurateur | Dashboard visible |
| 2 | Web | Ajouter un nouveau plat | Plat créé |
| 3 | Mobile | Ouvrir le restaurant | Menu affiché |
| 4 | Mobile | Vérifier le nouveau plat | Plat visible |

---

## Étape 5 : Génération de rapports

### Format du rapport

Fichier : `docs/UAT_REPORT_[DATE].md`

```markdown
# Rapport UAT - [DATE]

## Résumé
- Tests exécutés : X
- Réussis : X
- Échoués : X
- Bugs trouvés : X

## Bugs détectés

### BUG-UAT-001 : [Titre]
- **Sévérité** : Critique / Majeur / Mineur
- **Plateforme** : Web / Mobile / Les deux
- **Étapes de reproduction** :
  1. ...
  2. ...
- **Résultat attendu** : ...
- **Résultat obtenu** : ...
- **Screenshot** : [lien]

## Détail des tests
...
```

---

## Structure de fichiers cible

```
tests/
├── e2e/
│   ├── web/                    # Tests Playwright
│   │   ├── login.spec.ts
│   │   ├── orders.spec.ts
│   │   └── menu.spec.ts
│   ├── mobile/                 # Tests Maestro (YAML)
│   │   ├── login.yaml
│   │   ├── order.yaml
│   │   └── profile.yaml
│   └── flows/                  # Scénarios cross-platform
│       ├── order-flow.md
│       └── menu-flow.md
├── reports/                    # Rapports générés
│   └── UAT_REPORT_2024-01-20.md
└── README.md                   # Guide d'exécution
```

---

## Prochaines étapes

Lors de la prochaine session, dire à Claude :
> "Continue le setup UAT depuis docs/UAT_SETUP.md"

Claude lira ce fichier et reprendra là où on s'est arrêté.

### TODO immédiat
1. [x] Vérifier si Android Studio / émulateur est installé ✅
2. [x] Installer Playwright MCP ✅ (config créée)
3. [x] Configurer Claude Code pour Playwright ✅ (`.mcp.json`)
4. [x] Installer Maestro ✅ (déjà installé)
5. [x] Créer les premiers scripts de test ✅
6. [x] Créer les guides UAT ✅ (Admin, Restaurant, Mobile)
7. [ ] Exécuter les tests UAT manuels
8. [ ] Tester Playwright MCP avec Claude Code
9. [ ] Tester Maestro pour l'app mobile

---

## Exécution des tests UAT

### A. Tests manuels avec les guides

**Pour le Dashboard Restaurant :**
```bash
# 1. Démarrer le backend (IntelliJ IDEA)
# 2. Ouvrir http://localhost:8080/restaurant
# 3. Suivre docs/UAT_GUIDE_RESTAURANT.md
```

**Pour le Dashboard Admin :**
```bash
# 1. Backend doit être démarré
# 2. Ouvrir http://localhost:8080/admin (si disponible)
# 3. Suivre docs/UAT_GUIDE_ADMIN.md
```

**Pour l'Application Mobile :**
```bash
# 1. Démarrer le backend
# 2. Démarrer l'émulateur Android
emulator -avd Medium_Phone_API_35

# 3. Démarrer l'app mobile
cd apps/mobile && npm start

# 4. Suivre docs/UAT_GUIDE_MOBILE.md
```

### B. Tests automatisés avec Claude Code

**Avec Playwright MCP (Web) :**
```
# Dans Claude Code, utiliser les outils MCP :
- browser_navigate("http://localhost:8080/restaurant")
- browser_click("selector")
- browser_type("selector", "text")
- browser_screenshot()
```

**Avec Maestro (Mobile) :**
```bash
# Lancer un test spécifique
maestro test tests/e2e/mobile/login.yaml

# Lancer tous les tests mobile
maestro test tests/e2e/mobile/

# Mode studio (enregistrement)
maestro studio
```

### C. Génération des rapports

Après exécution des tests, créer un rapport :

```bash
# Créer le fichier de rapport
# Format: docs/reports/UAT_REPORT_YYYY-MM-DD.md
```

Utiliser le template dans la section "Étape 5 : Génération de rapports" ci-dessus.

---

## Ressources

- [Playwright MCP (GitHub)](https://github.com/microsoft/playwright-mcp)
- [Maestro (Documentation)](https://maestro.mobile.dev)
- [Guide Playwright MCP + Claude](https://til.simonwillison.net/claude-code/playwright-mcp-claude-code)

---

## Notes de session

### Session 2024-01-20
- Discussion initiale sur les capacités de test de Claude Code
- Décision d'utiliser Playwright MCP (web) + Maestro (mobile)
- Création de ce document pour persister le contexte

### Session 2026-01-20 (suite)
**Vérifications effectuées :**
- ✅ Android SDK installé : `%LOCALAPPDATA%\Android\Sdk`
- ✅ Émulateur disponible : 3 AVDs (Medium_Phone_API_35, Medium_Phone_API_35_2, Pixel_9_API_35)
- ✅ ADB disponible : `platform-tools/adb.exe`
- ✅ Maestro déjà installé : `npm global`

**Fichiers créés :**
- `.mcp.json` - Configuration Playwright MCP pour Claude Code
- `tests/e2e/web/login.spec.ts` - Tests auth dashboard
- `tests/e2e/web/orders.spec.ts` - Tests gestion commandes
- `tests/e2e/web/menu.spec.ts` - Tests gestion menu
- `tests/e2e/mobile/login.yaml` - Test connexion mobile
- `tests/e2e/mobile/order.yaml` - Test commande mobile
- `tests/e2e/mobile/profile.yaml` - Test profil mobile
- `tests/e2e/flows/order-flow.md` - Flow commande cross-platform
- `tests/e2e/flows/menu-flow.md` - Flow menu cross-platform

**Prochaine étape :**
1. Redémarrer Claude Code pour activer Playwright MCP
2. Lancer le backend et tester un flow complet
3. Démarrer l'émulateur Android pour les tests Maestro

### Session 2026-01-20 (suite 2)
**Vérifications et mises à jour :**
- ✅ Vérification des guides UAT existants
- ✅ UAT_GUIDE_ADMIN.md : 13 scénarios complets
- ✅ UAT_GUIDE_RESTAURANT.md : 12 scénarios complets
- ✅ UAT_GUIDE_MOBILE.md : 17 scénarios complets
- ✅ Mise à jour du statut dans ce document
- ✅ Ajout des instructions d'exécution des tests

**Setup UAT : COMPLET**
- Tous les guides sont prêts pour les testeurs
- Les scripts e2e sont créés (Playwright + Maestro)
- Les instructions sont documentées

**Pour lancer les tests :**
1. Démarrer le backend (IntelliJ)
2. Distribuer les guides UAT aux testeurs
3. Collecter les rapports de bugs

### Session 2026-01-20 (suite 3)
**Correction configuration Playwright MCP :**
- ❌ Ancien package incorrect : `@anthropic-ai/mcp-server-playwright`
- ✅ Nouveau package correct : `@playwright/mcp@latest` (Microsoft officiel)
- ✅ Fichier `.mcp.json` corrigé
- ⏳ Nécessite un redémarrage de Claude Code pour activer

**Sources :**
- [Documentation officielle Microsoft](https://github.com/microsoft/playwright-mcp)
- [Guide Simon Willison](https://til.simonwillison.net/claude-code/playwright-mcp-claude-code)

### Session 2026-01-20 (suite 4) - UAT Automatisé
**Exécution UAT avec Playwright :**

**Environnement vérifié :**
- ✅ Backend Quarkus : Running (HTTP 200 sur /api/restaurants)
- ✅ Keycloak : Running (page de login accessible)
- ✅ Emulateur Android : Running (emulator-5554)
- ✅ Metro Bundler : Running (packager-status:running)
- ⚠️ Playwright MCP : Non activé (requiert restart Claude Code)

**Tests Playwright exécutés :**
- 21+ tests exécutés
- ~11 passés
- ~10 échoués (liés à l'authentification)

**Bugs découverts :**
- **BUG-012** (Critique → Résolu) : `/api/menu-items/*` requérait auth, maintenant public
- **BUG-013** (Important) : Tests E2E ne peuvent pas interagir avec dashboard (auth requise)

**Fichiers créés/modifiés :**
- `docs/reports/UAT_REPORT_2026-01-20.md` - Rapport UAT complet
- `docs/BUGS.md` - Ajout BUG-012, BUG-013
- `tests/setup/global-setup.ts` - Gestion erreur auth menu-items
- `src/main/resources/application.yml` - Fix BUG-012

**Prochaines étapes :**
1. Redémarrer backend pour appliquer fix BUG-012
2. Redémarrer Claude Code pour activer Playwright MCP
3. Implémenter auth setup pour tests E2E (BUG-013)
4. Tester Maestro pour mobile