# Flow BMAD — OneEats

Guide d'usage rapide des workflows BMAD pour maintenir une documentation cohérente et exploitable par les agents.

## Prérequis
- Lire `CLAUDE.md` et `CONTEXT.md` avant d'invoquer un workflow.
- Ne pas supprimer ni réécrire les artefacts `_bmad-output/` (planning-artifacts, implementation-artifacts, archives).
- La documentation active est référencée dans `docs/README.md` (DOCS-INDEX à ajouter ultérieurement si nécessaire).

## Workflows clés (manifest `_bmad/_config/workflow-manifest.csv`)
- `workflow-status` : savoir "que faire maintenant" à partir du statut YAML.
- `document-project` : cartographier le code et générer une vue de référence.
- `quick-spec` : produire une spec prête à coder à partir d'un besoin ciblé.
- `quick-dev` : implémenter rapidement à partir d'une spec ou d'instructions directes.
- `harmonize-markdown` : normaliser les docs Markdown sur le périmètre actif.
- `party-mode` (optionnel) : discussion multi-agents pour arbitrer ou débloquer.

## Flow recommandé
1. **Initialiser/contexte** : exécuter `workflow-status` (ou `workflow-init` si aucun statut) pour situer l'étape courante.
2. **Cartographier** : lancer `document-project` si le périmètre ou la doc a bougé de façon notable (sorties dans `_bmad-output/planning-artifacts/`).
3. **Spécifier** : utiliser `quick-spec` pour cadrer une tâche ; si besoin, compléter par `prd` ou `create-architecture`.
4. **Exécuter** : suivre `quick-dev` (ou `dev-story` si story formalisée), puis couvrir via tests appropriés.
5. **Normaliser la doc** : passer `harmonize-markdown` sur les fichiers modifiés (`docs/`, `README.md`, ADR, guides).
6. **Clore/archiver** : remettre à jour `workflow-status`; déplacer les documents obsolètes dans `docs/archive/` et enregistrer l'emplacement dans `docs/archive/README.md`.

## Points d'attention
- Langue par défaut : français ; garder titres sobres, pas d'emojis.
- Laisser les traces BMAD générées dans `_bmad-output/` pour audit et reprise de contexte.
- Quand un document est archivé, ajouter un lien ou note de redirection depuis la nouvelle version.

