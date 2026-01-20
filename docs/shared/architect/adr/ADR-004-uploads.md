# ADR-004 — Uploads images (menu/restaurant) et stockage

## Contexte
- `API_SPECS.md` prévoit upload logo restaurant et image de menu.
- Dev actuel utilise FS local; cible ultérieure vers stockage objet (S3/GCS).
- Risques : taille/format, sécurité, URL publiques.

## Décision
- Dev/MVP : stockage local (filesystem) avec validation (taille max 2–5 Mo, formats jpg/png/webp), nommage sécurisé, chemin servi statiquement par Quarkus.
- Cible : abstraction de storage permettant de basculer vers S3/GCS sans impacter l’API.
- Servir les URLs publiques via Quarkus (rewrite) ou direct bucket si public-read.

## Conséquences
- Implémenter un service d’upload avec validation et sanitation des noms.
- Ajouter configuration pour dossier d’uploads (dev) et credentials S3/GCS (prod) quand prêt.
- Mettre à jour `API_SPECS.md` si besoin de champs additionnels (e.g., width/height, mime).

## Actions
- Ajouter service de storage abstrait + impl FS ; prévoir impl S3/GCS.
- Ajouter configuration taille max, formats autorisés, chemin public.
- Tests : upload valide/invalid, sécurité MIME, accès URL.

## Status
Accepted (2026-01-14)

