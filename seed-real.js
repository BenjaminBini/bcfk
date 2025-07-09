const Database = require('./database');

const db = new Database();

// Données réelles des membres
const members = [
  { prenom: 'Adeline', nom: 'Jeanneret', telephone: '06 78 77 79 39', email: 'adelinejeanneret329@gmail.com', whatsapp: 'Oui' },
  { prenom: 'Benjamin', nom: 'Bini', telephone: '06 63 78 63 64', email: 'benjamin@bini.io', whatsapp: 'Oui' },
  { prenom: 'Bernadette', nom: 'Laugner', telephone: '06 87 24 72 81', email: 'bernadette.laugner@gmail.com', whatsapp: 'Oui' },
  { prenom: 'Bruno', nom: 'Knaub', telephone: '06 12 76 17 14', email: 'bruno.knaub@gmail.com', whatsapp: 'Oui' },
  { prenom: 'Carmen', nom: 'Koebel', telephone: '06 42 54 09 36', email: 'carmen.koebel@orange.fr', whatsapp: 'Non, pas de compte WA' },
  { prenom: 'Caroline', nom: 'Pfaffenhof', telephone: '06 62 38 55 54', email: 'cacoquille@yahoo.fr', whatsapp: 'Oui' },
  { prenom: 'Christian', nom: 'Lieber', telephone: '06 51 40 84 16', email: 'chrislieb67@live.fr', whatsapp: 'Invit envoyée' },
  { prenom: 'Dominique', nom: 'Lesenne', telephone: '06 64 87 93 44', email: 'dom.lesenne@gmail.com', whatsapp: 'Oui' },
  { prenom: 'Frédérique', nom: 'Marchal', telephone: '06 24 57 39 51', email: 'frederique.marchal@yahoo.fr', whatsapp: 'Oui' },
  { prenom: 'Josée', nom: 'Bechet-Zilliox', telephone: '06 07 15 62 71', email: 'josee@bechet.org', whatsapp: 'Oui' },
  { prenom: 'Liliana', nom: '', telephone: '07 49 66 67 70', email: '', whatsapp: 'Oui' },
  { prenom: 'Marie', nom: '', telephone: '06 74 25 24 01', email: 'brandibas.mari@gmail.com', whatsapp: 'Invit envoyée' },
  { prenom: 'Nathalie', nom: '', telephone: '06 42 50 84 55', email: '', whatsapp: 'Oui' },
  { prenom: 'Sandrine', nom: 'Wantz', telephone: '06 89 71 02 49', email: 'sandrinew@orange.fr', whatsapp: 'Oui' },
  { prenom: 'Théo', nom: 'Dettmann', telephone: '06 67 89 34 43', email: 'theodore.dettmann@bbox.fr', whatsapp: 'Non' },
  { prenom: 'Thomas', nom: 'Lobstein', telephone: '06 88 39 35 06', email: 'lobstein.thomas@gmail.com', whatsapp: 'Oui' },
  { prenom: 'Anne', nom: 'Rubin', telephone: '06 64 13 91 70', email: 'anne.rubin@hotmail.fr', whatsapp: 'Oui' }
];

// Affectations par défaut (exemples basés sur les vrais membres)
const defaultAssignments = [
  // Lundi
  { weekday: 0, slot_type: 'ouverture', member_names: ['Benjamin Bini', 'Marie'] },
  { weekday: 0, slot_type: 'fermeture', member_names: ['Thomas Lobstein', 'Caroline Pfaffenhof'] },
  
  // Mardi
  { weekday: 1, slot_type: 'ouverture', member_names: ['Bruno Knaub'] },
  { weekday: 1, slot_type: 'fermeture', member_names: ['Sandrine Wantz', 'Dominique Lesenne'] },
  
  // Mercredi
  { weekday: 2, slot_type: 'ouverture', member_names: ['Adeline Jeanneret', 'Frédérique Marchal'] },
  { weekday: 2, slot_type: 'fermeture', member_names: ['Josée Bechet-Zilliox'] },
  
  // Jeudi
  { weekday: 3, slot_type: 'ouverture', member_names: ['Bernadette Laugner'] },
  { weekday: 3, slot_type: 'fermeture', member_names: ['Christian Lieber', 'Anne Rubin'] },
  
  // Vendredi
  { weekday: 4, slot_type: 'ouverture', member_names: ['Théo Dettmann'] },
  { weekday: 4, slot_type: 'fermeture', member_names: ['Carmen Koebel', 'Liliana'] },
  
  // Samedi
  { weekday: 5, slot_type: 'ouverture', member_names: ['Benjamin Bini', 'Nathalie'] },
  { weekday: 5, slot_type: 'fermeture', member_names: ['Thomas Lobstein'] },
  
  // Dimanche
  { weekday: 6, slot_type: 'ouverture', member_names: ['Marie'] },
  { weekday: 6, slot_type: 'fermeture', member_names: ['Bruno Knaub', 'Sandrine Wantz'] }
];

async function seedRealDatabase() {
  console.log('Initialisation de la base de données avec les vraies données des membres...');
  
  // Supprimer les données existantes
  await new Promise((resolve, reject) => {
    db.db.run('DELETE FROM weekly_slots', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  await new Promise((resolve, reject) => {
    db.db.run('DELETE FROM default_assignments', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  await new Promise((resolve, reject) => {
    db.db.run('DELETE FROM members', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  // Ajouter les vrais membres
  for (const member of members) {
    await new Promise((resolve, reject) => {
      db.addMember(member.prenom, member.nom, (err) => {
        if (err) {
          console.error(`Erreur lors de l'ajout du membre ${member.prenom} ${member.nom}:`, err);
          reject(err);
        } else {
          console.log(`Membre ajouté : ${member.prenom} ${member.nom}`);
          resolve();
        }
      });
    });
  }
  
  // Récupérer tous les membres pour mapper les noms aux IDs
  const allMembers = await new Promise((resolve, reject) => {
    db.getAllMembers((err, members) => {
      if (err) reject(err);
      else resolve(members);
    });
  });
  
  const memberMap = {};
  allMembers.forEach(member => {
    const fullName = member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name;
    memberMap[fullName] = member.id;
  });
  
  // Ajouter les affectations par défaut
  for (const assignment of defaultAssignments) {
    const memberIds = assignment.member_names
      .map(name => memberMap[name])
      .filter(id => id !== undefined); // Filtrer les membres non trouvés
    
    if (memberIds.length > 0) {
      await new Promise((resolve, reject) => {
        db.setDefaultAssignment(assignment.weekday, assignment.slot_type, memberIds, (err) => {
          if (err) {
            console.error(`Erreur lors de la définition de l'affectation par défaut pour ${assignment.weekday}/${assignment.slot_type}:`, err);
            reject(err);
          } else {
            console.log(`Affectation par défaut définie : ${assignment.weekday}/${assignment.slot_type} -> ${assignment.member_names.join(', ')}`);
            resolve();
          }
        });
      });
    } else {
      console.log(`Aucun membre trouvé pour l'affectation ${assignment.weekday}/${assignment.slot_type}`);
    }
  }
  
  console.log('Initialisation de la base de données avec les vraies données terminée !');
  console.log('Vous pouvez maintenant démarrer le serveur avec : npm start');
  
  db.close();
}

seedRealDatabase().catch(console.error);