# Application de Planning d'Association

Une application web full-stack avec frontend Svelte et backend Node.js pour gérer le planning hebdomadaire d'une association avec des créneaux quotidiens "ouverture" et "fermeture".

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

2. Initialiser la base de données avec des données d'exemple :
```bash
npm run seed
```

3. Démarrer l'application en mode développement :
```bash
npm run dev            # Démarre backend (port 3001) et frontend (port 5173)
npm run dev:server     # Démarre seulement le backend avec nodemon
npm run dev:svelte     # Démarre seulement le frontend avec Vite
```

4. Compiler le frontend pour la production :
```bash
npm run build          # Compile le frontend Svelte
npm start              # Démarre le serveur de production
```

Commandes utiles :
```bash
npm run cleanup        # Termine les processus sur le port 3001
```

## Utilisation

1. En développement : ouvrez votre navigateur et allez à `http://localhost:5173`
2. En production : ouvrez votre navigateur et allez à `http://localhost:3001`
3. Naviguez entre les vues principales :
   - **Planning** : Voir et gérer le planning de la semaine actuelle
   - **Affectations** : Configurer les affectations de membres par défaut pour chaque créneau de jour de semaine
   - **Absences** : Gérer les absences des membres

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
- **Base de Données** : SQLite3 avec wrapper Database personnalisé
- **Frontend** : Svelte SPA + Vite (développement)
- **Style** : Tailwind CSS (Thème sombre)
- **Architecture** : Services, Controllers, Middleware
- **État** : Stores Svelte pour la gestion d'état frontend

## Architecture

L'application suit une architecture full-stack avec séparation frontend/backend :

### Structure Backend
```
├── app.js                      # Application Express principale
├── database.js                 # Wrapper SQLite avec méthodes Promise
├── config/                     # Configuration centralisée
├── controllers/                # Contrôleurs (gestion routes)
├── services/                   # Services (logique métier)
├── middleware/                 # Middleware (gestion erreurs)
└── routes/                     # Routage modulaire API
```

### Structure Frontend (Svelte)
```
src/
├── App.svelte                  # Composant racine
├── pages/                      # Composants de page (routes)
├── components/                 # Composants réutilisables
├── stores/                     # Stores Svelte (état global)
└── lib/                        # Utilitaires (client API)
```

### Architecture Hybride
- **Backend** : Node.js + Express sur port 3001 (routes `/api/*`)
- **Frontend** : Svelte SPA servi par Vite sur port 5173 (développement)
- **Base de Données** : SQLite3 avec classe Database wrapper personnalisée
- **Vues** : Hybride - templates EJS (`/planning`, `/assignments`) + routes Svelte SPA