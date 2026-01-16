# Checklist des Secrets CI/CD

Ce document liste les secrets nécessaires pour la pipeline CI/CD OneEats.

## Secrets Optionnels

Ces secrets améliorent l'expérience CI mais ne sont pas obligatoires :

### 1. SLACK_WEBHOOK_URL

**But** : Recevoir des notifications Slack en cas d'échec de la pipeline.

**Comment l'obtenir** :
1. Aller sur https://api.slack.com/apps
2. Créer une nouvelle app ou utiliser une existante
3. Activer "Incoming Webhooks"
4. Créer un webhook pour le channel souhaité
5. Copier l'URL du webhook

**Configurer dans GitHub** :
```
Settings > Secrets > Actions > New repository secret
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/xxx/yyy/zzz
```

---

### 2. CODECOV_TOKEN

**But** : Publier les rapports de couverture de code sur Codecov.

**Comment l'obtenir** :
1. Se connecter sur https://codecov.io avec GitHub
2. Ajouter le repository
3. Copier le token depuis les settings du repo

**Configurer dans GitHub** :
```
Settings > Secrets > Actions > New repository secret
Name: CODECOV_TOKEN
Value: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## Vérification

Après configuration, vérifiez que les secrets fonctionnent :

- [ ] `SLACK_WEBHOOK_URL` : Provoquez un échec de test et vérifiez la notification Slack
- [ ] `CODECOV_TOKEN` : Après un push, vérifiez le rapport sur codecov.io

## Secrets Futurs (Non utilisés actuellement)

Ces secrets pourront être ajoutés plus tard :

| Secret | But | Priorité |
|--------|-----|----------|
| `SONAR_TOKEN` | Analyse SonarQube | Moyenne |
| `DOCKER_USERNAME` | Push images Docker | Basse |
| `DOCKER_PASSWORD` | Push images Docker | Basse |
| `AWS_ACCESS_KEY_ID` | Déploiement AWS | Basse |
| `AWS_SECRET_ACCESS_KEY` | Déploiement AWS | Basse |

## Bonnes Pratiques de Sécurité

1. **Ne jamais commiter de secrets** dans le code
2. **Utiliser des tokens avec permissions minimales**
3. **Rotation régulière** des secrets sensibles
4. **Audit** : Vérifier régulièrement les accès aux secrets

---

*Document généré par BMAD Test Architect*
