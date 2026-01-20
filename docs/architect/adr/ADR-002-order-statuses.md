# ADR-002 — Nomenclature des statuts de commande (alignement global)

## Contexte
- `BUSINESS_RULES.md` décrit les statuts FR : EN_ATTENTE, EN_PREPARATION, PRETE, RECUPEREE, ANNULEE.
- `API_SPECS.md` utilise les termes EN : pending, preparing, ready, delivered, cancelled.
- Risque de divergence front web/mobile vs backend vs DB.

## Décision
- Adopter une nomenclature canonique en anglais pour l’API/backend/DB : `PENDING`, `PREPARING`, `READY`, `PICKED_UP`, `CANCELLED`.
- Mapping documentaire FR : EN_ATTENTE→PENDING, EN_PREPARATION→PREPARING, PRETE→READY, RECUPEREE→PICKED_UP, ANNULEE→CANCELLED.
- Harmoniser `API_SPECS.md`, DTO, enums backend et front web/mobile, scripts DB/migrations.

## Conséquences
- Simplifie la cohérence front/back et la serialisation JSON.
- Nécessite mise à jour des tests, fixtures, mocks (web/mobile) et éventuellement données de démo.

## Actions
- Mettre à jour `API_SPECS.md` (endpoints Order, notifications) avec la nomenclature canonique.
- Mettre à jour code backend (enum OrderStatus) et transitions.
- Mettre à jour front web/mobile (types, mocks, UI) pour refléter les mêmes valeurs.
- Mettre à jour DATA_MODEL/DB si colonnes/contraintes reposent sur ces valeurs.

## Status
Accepted (2026-01-14)

