// Fichier de test pour créer un petit fichier Excel de démonstration
import * as XLSX from 'xlsx';
import fs from 'fs';

const testData = [
  [
    'Nom de l\'entreprise',
    'Adresse',
    'Ville',
    'Code postal',
    'Téléphone',
    'Email',
    'Site web',
    'Catégorie',
    'Département',
    'Région'
  ],
  [
    'Le Bistrot Parisien',
    '123 Rue de la Paix',
    'Paris',
    '75001',
    '01 42 12 34 56',
    'contact@bistrotparisien.fr',
    'www.bistrotparisien.fr',
    'Restaurant',
    '75',
    'Île-de-France'
  ],
  [
    'Café de Lyon',
    '456 Avenue des Lumières',
    'Lyon',
    '69002',
    '04 72 34 56 78',
    'info@cafelyon.fr',
    'www.cafelyon.fr',
    'Café',
    '69',
    'Auvergne-Rhône-Alpes'
  ],
  [
    'Brasserie Marseille',
    '789 Boulevard du Vieux Port',
    'Marseille',
    '13001',
    '04 91 23 45 67',
    'brasserie@marseille.fr',
    'www.brasseriemarseille.fr',
    'Brasserie',
    '13',
    'Provence-Alpes-Côte d\'Azur'
  ],
  [
    'Hôtel Restaurant Nice',
    '321 Promenade des Anglais',
    'Nice',
    '06000',
    '04 93 12 34 56',
    'hotel@niceresort.fr',
    'www.niceresort.fr',
    'Hôtel Restaurant',
    '06',
    'Provence-Alpes-Côte d\'Azur'
  ],
  [
    'Bistrot Toulousain',
    '654 Rue du Capitole',
    'Toulouse',
    '31000',
    '05 61 23 45 67',
    'bistrot@toulouse.fr',
    'www.bistrot-toulouse.fr',
    'Bistrot',
    '31',
    'Occitanie'
  ]
];

// Créer le workbook et la feuille
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(testData);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospects');

// Écrire le fichier
XLSX.writeFile(workbook, 'test-prospects-france.xlsx');
console.log('✅ Fichier de test créé : test-prospects-france.xlsx');
