// Application configuration
const path = require('path');

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
  },

  // Database configuration
  database: {
    path: path.join(__dirname, '..', 'planning.db'),
    options: {
      verbose: process.env.NODE_ENV === 'development'
    }
  },

  // Application settings
  app: {
    name: 'Planning Hebdomadaire de l\'Association',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    viewEngine: 'ejs',
    staticDir: 'public'
  },

  // Date and time settings
  datetime: {
    locale: 'fr-FR',
    timezone: 'Europe/Paris'
  },

  // UI configuration
  ui: {
    dayNames: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    slotTypes: ['ouverture', 'fermeture'],
    theme: 'dark'
  },

  // API settings
  api: {
    timeout: 30000,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
};