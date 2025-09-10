# 🧹 Tests E2E - Artifacts et Gitignore

## 📁 Fichiers générés par les tests E2E

Les tests Playwright génèrent automatiquement plusieurs types de fichiers :

### 🚫 Fichiers EXCLUS du versioning Git

```
tests/test-results/        # Résultats détaillés des tests
tests/reports/             # Rapports HTML
tests/playwright-report/   # Rapport Playwright intégré
*.png                      # Screenshots des échecs/succès
*.webm                     # Vidéos des tests
*.zip                      # Traces et artifacts compressés
.last-run.json            # Métadonnées de la dernière exécution
```

### ✅ Fichiers VERSIONNÉS sur Git

```
tests/specs/               # Tests sources (.spec.ts)
tests/playwright.config.ts # Configuration Playwright
tests/package.json         # Dépendances des tests
tests/setup/               # Scripts de configuration
tests/README.md           # Documentation
```

## 🔧 Configuration dans .gitignore

Les exclusions suivantes ont été ajoutées au `.gitignore` racine :

```gitignore
# E2E Tests artifacts (Playwright)
tests/test-results/
tests/reports/
tests/playwright-report/
tests/test-artifacts/
test-results/
reports/
playwright-report/
.last-run.json
*.png
*.webm
*.zip
trace.zip
```

## 🎯 Pourquoi exclure ces fichiers ?

1. **Volume** : Screenshots/vidéos = plusieurs MB par test
2. **Temporaires** : Régénérés à chaque exécution
3. **Locaux** : Spécifiques à l'environnement de test
4. **Sensibles** : Peuvent contenir des données de test
5. **Performance** : Ralentit git clone/pull/push

## 📊 Exemple de taille

```
tests/test-results/    ~50MB (après suite complète)
tests/reports/         ~10MB (rapport HTML)
tests/playwright-report/ ~30MB (vidéos + screenshots)
Total                  ~90MB pour une exécution
```

## ✨ Commandes utiles

```bash
# Nettoyer manuellement les artifacts
rm -rf tests/test-results tests/reports tests/playwright-report

# Voir les fichiers ignorés
git status --ignored tests/

# Forcer l'ajout d'un fichier ignoré (si nécessaire)
git add -f tests/specs/important-test.spec.ts
```

---
📅 Dernière mise à jour : 10/09/2025  
🔧 Configuration par : Claude Code  