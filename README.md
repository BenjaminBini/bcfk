# BCFK - Planning d'Association

Application web moderne pour la gestion des plannings hebdomadaires d'association avec créneaux d'ouverture/fermeture.

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Développement (backend + frontend)
npm run dev

# Production
npm run build && npm start
```

**URLs:**
- **Développement**: http://localhost:5173 (frontend) + http://localhost:3001 (API)
- **Production**: http://localhost:3001

## ✨ Fonctionnalités

### 📅 Planning Hebdomadaire
- Vue responsive avec navigation entre semaines
- Animation fluide lors du changement de semaine
- Gestion des créneaux ouverture/fermeture par jour
- Affichage des absences et affectations spécifiques

### 👥 Gestion des Membres
- Ajout/modification des membres de l'association
- Système d'affectations récurrentes et spécifiques
- Gestion des absences avec plages de dates

### 📱 Interface Moderne
- Design responsive mobile-first
- Thème sombre avec Tailwind CSS
- Animations et transitions fluides
- Menu burger mobile avec navigation optimisée

## 🛠️ Stack Technique

**Frontend:** Svelte 5 + Vite + Tailwind CSS  
**Backend:** Node.js + Express + SQLite3  
**Déploiement:** Docker + Volume persistence

## 📊 Base de Données

```sql
members                 -- Membres de l'association
recurring_assignments   -- Affectations hebdomadaires récurrentes
specific_assignments    -- Affectations pour dates spécifiques
absences               -- Gestion des absences par période
```

## 🐳 Docker

```bash
# Démarrage avec persistance
docker-compose up -d

# Synchronisation des données
npm run sync
```

## 📚 Scripts Utiles

```bash
npm run dev:server     # Backend seulement
npm run dev:svelte     # Frontend seulement  
npm run build          # Build production
npm run cleanup        # Nettoyer les processus port 3001
npm run sync           # Synchroniser vers serveur distant
```

## 🏗️ Architecture

```
├── src/                    # Frontend Svelte
│   ├── pages/             # Routes principales
│   ├── components/        # Composants réutilisables
│   └── stores/            # État global Svelte
├── controllers/           # Logique des routes API
├── services/             # Logique métier
├── database.js           # Wrapper SQLite
└── public/dist/          # Build frontend
```

## 🔧 Configuration

L'application utilise des variables d'environnement pour la configuration et supporte le déploiement via Docker avec persistance des données.

---

**Production:** https://bcfk.bini.io