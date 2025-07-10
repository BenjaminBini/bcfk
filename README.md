# Application de Planning d'Association

Une application web Node.js + HTMX pour gérer le planning hebdomadaire d'une association avec des créneaux quotidiens "ouverture" et "fermeture".

## Fonctionnalités

- **Vue Planning Hebdomadaire** : Affiche la semaine actuelle (Lundi-Dimanche) avec les créneaux et les membres affectés
- **Affectations par Défaut** : Gérer les affectations de membres par défaut pour chaque créneau de jour de semaine
- **Gestion des Membres** : Ajouter de nouveaux membres à l'association
- **Génération Automatique** : Générer des plannings hebdomadaires à partir des affectations par défaut

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Compiler le CSS :
```bash
npm run build-css
```

3. Initialiser la base de données avec des données d'exemple :
```bash
npm run seed
```

4. Démarrer le serveur :
```bash
npm start
```

Ou utiliser nodemon pour le développement :
```bash
npm run dev
```

## Utilisation

1. Ouvrez votre navigateur et allez à `http://localhost:3000`
2. Naviguez entre les deux vues principales :
   - **Semaine Actuelle** : Voir et gérer le planning de la semaine actuelle
   - **Affectations par Défaut** : Configurer les affectations de membres par défaut pour chaque créneau de jour de semaine

## Schéma de Base de Données

L'application utilise SQLite avec trois tables principales :
- `members` : Stocker les membres de l'association
- `recurring_assignments` : Stocker les affectations récurrentes pour les créneaux de jour de semaine
- `specific_assignments` : Stocker les affectations spécifiques pour des dates précises

## Points d'Accès API

- `GET /planning` - Vue du planning hebdomadaire
- `GET /assignments` - Vue des affectations par défaut
- `POST /api/members` - Ajouter un nouveau membre
- `POST /api/assignments/:weekday/:slotType` - Définir une affectation par défaut
- `POST /api/weekly-slots/:date/:slotType` - Mettre à jour un créneau hebdomadaire
- `POST /api/generate-week` - Générer des créneaux hebdomadaires à partir des défauts

## Pile Technologique

- **Backend** : Node.js, Express.js (Architecture MVC)
- **Base de Données** : SQLite3
- **Frontend** : HTMX, Modèles EJS avec Partials
- **Style** : Tailwind CSS (Thème sombre)
- **Architecture** : Services, Controllers, Middleware

## Architecture

L'application suit une architecture MVC modulaire :

```
├── app.js                      # Application principale
├── server.js                   # Point d'entrée
├── config/                     # Configuration centralisée
├── controllers/                # Contrôleurs (gestion routes)
├── services/                   # Services (logique métier)
├── middleware/                 # Middleware (gestion erreurs)
├── routes/                     # Routage modulaire
├── views/partials/             # Composants EJS réutilisables
└── public/js/                  # JavaScript modulaire
```