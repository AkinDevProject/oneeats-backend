# Harmonize Markdown Instructions

## Objectif
Uniformiser les fichiers Markdown (titres, TOC, style) sur le périmètre défini.

## Règles de style
- H1 unique sans emoji. H2/H3 sans emoji.
- Emojis autorisés dans le corps uniquement si apportent de la clarté.
- TOC automatique ajouté pour les fichiers > 30 lignes, sauf ADR et archive.
- Badges uniquement dans `README.md` racine (build/tests si existants).
- Listes: puces `-`. Numérotation standard pour listes ordonnées.
- Blocs de code: fences ```lang avec langage quand identifiable.
- Liens relatifs privilégiés. Pas de trailing spaces. Largeur max recommandée: 120 colonnes.
- Pas de double espaces avant retours. Titres sans ponctuation finale.

## Périmètre
- Inclus: `docs/**/*.md`, `README.md`
- Exclus: `docs/archive/**`, `docs/adr/**`

## Étapes suggérées
1. Charger le contexte projet (architecture, conventions si dispo).
2. Scanner les fichiers du scope et appliquer les règles.
3. Générer/mettre à jour la TOC conditionnelle.
4. Ne pas modifier le fond, seulement la forme (titres, listes, code fences, espacements).

## Notes
- Ne pas ajouter d’emojis dans les titres.
- Conserver les blocs de code existants en ajoutant un hint de langage si évident.
- Ne pas insérer de badges dans les docs internes, uniquement README racine si manquants.
- Ne pas toucher aux ADR (conformément à l’exclusion) ni aux fichiers en archive.

