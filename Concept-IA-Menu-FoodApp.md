# 📖 Concept IA - Génération Automatique de Menus pour FoodApp

## 🎯 Objectif
Faciliter la création des menus pour les restaurants en utilisant une IA qui transforme un menu brut (photo, PDF, texte, site web) en **données structurées**.  
Ces données alimentent ensuite une **interface utilisateur dynamique**, que le restaurateur peut modifier avant validation et publication.

---

## 📝 Workflow Général

### 1. Entrée
- Le restaurateur fournit son menu sous l’une des formes suivantes :
  - Texte brut (copié/collé).
  - PDF ou Word.
  - Photo du menu papier (OCR nécessaire).
  - Lien vers un site web (scraping).

### 2. Extraction IA
- L’IA (GPT, Claude, ou modèle spécialisé OCR + NLP) analyse le contenu.
- Elle renvoie les données en **JSON structuré** :
  - Catégories (entrées, plats, desserts, boissons, etc.)
  - Plats (nom, description, prix, allergènes, image si dispo).
  - Options (suppléments, tailles, ingrédients, etc.)
  - Ordre d’affichage (priorité des catégories et plats).

### 3. Génération UI Dynamique
- Le frontend (React/React Native) lit le JSON et construit automatiquement :
  - Une vue par catégorie.
  - Les plats avec leur prix et description.
  - Les options configurables.
- La vue est **interactive** :
  - Édition des champs (prix, nom, description).
  - Suppression ou ajout de plats/options.
  - Drag & drop pour réorganiser.

### 4. Validation
- Une fois satisfait, le restaurateur clique sur **Valider**.
- Le JSON final est envoyé à l’API backend (Quarkus + PostgreSQL).
- Sauvegarde dans la base (`restaurant_menu`, `menu_item`, `options`).
- Le menu devient **actif** dans l’application FoodApp.

---

## 🛠️ Exemple Concret

### Menu Brut
```
Entrées :

* Salade César … 8,90 €
* Soupe du jour … 6,50 €

Plats :

* Pizza Margherita … 11,00 €
* Spaghetti Bolognaise … 12,50 €
  Options :
* Extra fromage +2 €
* Pâte sans gluten +1 €
```

### JSON Généré
```json
{
  "categories": [
    {
      "name": "Entrées",
      "items": [
        { "name": "Salade César", "price": 8.90 },
        { "name": "Soupe du jour", "price": 6.50 }
      ]
    },
    {
      "name": "Plats",
      "items": [
        { "name": "Pizza Margherita", "price": 11.00 },
        { "name": "Spaghetti Bolognaise", "price": 12.50,
          "options": [
            { "name": "Extra fromage", "price": 2.00 },
            { "name": "Pâte sans gluten", "price": 1.00 }
          ]
        }
      ]
    }
  ]
}
```

### Vue Dynamique (UI)

* **Entrées**
  * Salade César – 8,90 € (✏️ Modifier)
  * Soupe du jour – 6,50 € (🗑️ Supprimer)
* **Plats**
  * Pizza Margherita – 11,00 €
  * Spaghetti Bolognaise – 12,50 €
    * Options :
      * Extra fromage +2 €
      * Pâte sans gluten +1 €
* Boutons : `+ Ajouter un plat`, `+ Ajouter une catégorie`, `✔ Valider`

---

## ✅ Faisabilité Technique

### Extraction IA

* **Texte brut** → GPT/Claude (fiable et rapide).
* **PDF/Image** → OCR (Tesseract, AWS Textract, Google Vision API) + GPT pour structurer.
* **Site web** → scraping + parsing HTML.

### UI Dynamique

* **React / React Native** : rendu basé sur JSON.
* Composants d’édition :
  * Inputs (text, number, textarea).
  * Switch pour options obligatoires.
  * Drag & drop (librairies comme `react-beautiful-dnd`).

### Backend

* **Quarkus + PostgreSQL**.
* Entités :
  * `RestaurantMenu`
  * `MenuCategory`
  * `MenuItem`
  * `MenuItemOption`
* Validation côté backend pour éviter incohérences.

---

## 🚀 Avantages

* **Gain de temps** pour le restaurateur (pas besoin de tout saisir).
* **Réduction des erreurs** (orthographe, prix, duplication).
* **Expérience moderne** → différenciation vis-à-vis des concurrents.
* **Contrôle qualité** assuré via l’étape de validation.

---

## 🔮 Étapes Suivantes

1. Écrire un **prompt standardisé** pour transformer un menu brut en JSON.
2. Implémenter un **prototype frontend** qui lit un JSON et génère un menu dynamique éditable.
3. Créer une **API de sauvegarde** dans le backend (Quarkus).
4. Tester avec différents types de menus (texte simple, PDF, photo).
5. Prévoir une version **semi-automatisée** : l’IA propose un menu → l’humain corrige.

---

👉 Ce document est ton **canevas de réflexion**.  
Tu veux que je t’ajoute directement un **prompt IA standardisé** (que tu pourrais tester dès maintenant avec GPT ou Claude) pour générer ton JSON à partir d’un menu brut ?