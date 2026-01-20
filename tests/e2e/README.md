# Tests End-to-End (E2E)

Ce dossier contient les tests automatises et scenarios cross-platform pour OneEats.

---

## Structure

```
tests/e2e/
├── web/                    # Tests Playwright (Dashboard)
│   ├── login.spec.ts       # Tests authentification
│   ├── orders.spec.ts      # Tests gestion commandes
│   └── menu.spec.ts        # Tests gestion menu
│
├── mobile/                 # Tests Maestro (App mobile)
│   ├── login.yaml          # Test connexion
│   ├── order.yaml          # Test commande complete
│   └── profile.yaml        # Test profil utilisateur
│
└── flows/                  # Scenarios cross-platform
    ├── order-flow.md       # Flow commande (Mobile -> Web)
    └── menu-flow.md        # Flow menu (Web -> Mobile)
```

---

## Tests Web (Playwright)

### Prerequis
- Node.js installe
- Backend demarre sur `http://localhost:8080`

### Execution avec Playwright CLI
```bash
# Installer Playwright
npm install -D @playwright/test

# Lancer tous les tests web
npx playwright test tests/e2e/web/

# Lancer un test specifique
npx playwright test tests/e2e/web/login.spec.ts

# Mode debug (avec navigateur visible)
npx playwright test --headed
```

### Execution avec Claude Code (Playwright MCP)
Claude Code peut executer ces tests interactivement via les outils MCP :
- `browser_navigate` - Navigation
- `browser_click` - Clics
- `browser_type` - Saisie de texte
- `browser_screenshot` - Captures d'ecran

---

## Tests Mobile (Maestro)

### Prerequis
- Maestro installe (`npm install -g maestro`)
- Emulateur Android demarre
- App mobile installee sur l'emulateur

### Execution
```bash
# Lancer un test specifique
maestro test tests/e2e/mobile/login.yaml

# Lancer tous les tests mobile
maestro test tests/e2e/mobile/

# Mode studio (enregistrement interactif)
maestro studio

# Prendre un screenshot
maestro screenshot
```

### Demarrer l'emulateur
```bash
# Lister les AVDs disponibles
emulator -list-avds

# Lancer un emulateur
emulator -avd Medium_Phone_API_35
```

---

## Flows Cross-Platform

Les fichiers dans `flows/` decrivent des scenarios qui impliquent plusieurs plateformes :

1. **order-flow.md** : Client passe commande (Mobile) → Restaurateur la traite (Web)
2. **menu-flow.md** : Restaurateur modifie menu (Web) → Client voit les changements (Mobile)

Ces flows sont executes manuellement ou par Claude Code en alternant entre Playwright MCP et Maestro.

---

## Rapports

Les rapports de test sont generes dans `tests/reports/` :
- Utiliser le template `UAT_REPORT_TEMPLATE.md`
- Nommer les rapports `UAT_REPORT_YYYY-MM-DD.md`

---

## Guides UAT

Pour les tests manuels, consulter les guides dans `docs/` :
- [UAT_GUIDE_ADMIN.md](../../docs/UAT_GUIDE_ADMIN.md) - Dashboard Admin
- [UAT_GUIDE_RESTAURANT.md](../../docs/UAT_GUIDE_RESTAURANT.md) - Dashboard Restaurant
- [UAT_GUIDE_MOBILE.md](../../docs/UAT_GUIDE_MOBILE.md) - App Mobile

---

## Configuration

### Playwright MCP (`.mcp.json`)
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-playwright", "--browser", "chromium"]
    }
  }
}
```

### Variables d'environnement
```bash
# URLs de test
BASE_URL=http://localhost:8080
MOBILE_BACKEND_URL=http://10.0.2.2:8080  # Pour emulateur Android
```

---

## Commandes utiles

```bash
# Verifier ADB (connexion emulateur)
adb devices

# Installer l'APK sur l'emulateur
adb install path/to/app.apk

# Voir les logs de l'emulateur
adb logcat
```
