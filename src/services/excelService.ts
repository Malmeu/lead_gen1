import * as XLSX from 'xlsx';

export interface ExcelLead {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  city?: string;
  postalCode?: string;
  department?: string;
  region?: string;
  manager?: string;
  employees?: string;
  revenue?: string;
  siret?: string;
  naf?: string;
  rating?: number;
  notes?: string;
}

export interface ExcelFilters {
  category?: string;
  city?: string;
  department?: string;
  region?: string;
  hasPhone?: boolean;
  hasEmail?: boolean;
  hasWebsite?: boolean;
  minRating?: number;
  searchTerm?: string;
}

export class ExcelService {
  private data: ExcelLead[] = [];
  private columnMapping: { [key: string]: string[] } = {
    name: ['Nom de l\'entreprise', 'Nom', 'Raison sociale', 'Nom commercial'],
    address: ['Adresse', 'Adresse complète'],
    phone: ['Téléphone', 'Téléphone 1', 'Tél', 'Téléphone principal'],
    email: ['Email', 'Mail', 'E-mail'],
    website: ['Site web', 'Site Internet', 'Site'],
    category: ['Catégorie', 'Activité', 'Secteur d\'activité', 'Libellé Activité'],
    city: ['Ville', 'Commune', 'Localité'],
    postalCode: ['Code postal', 'CP', 'Code Postal'],
    department: ['Département'],
    region: ['Région'],
    manager: ['Gérant'],
    employees: ['Employés'],
    revenue: ['CA'],
    siret: ['SIRET'],
    naf: ['Code NAF', 'NAF', 'APE'],
    rating: ['Note', 'Évaluation'],
    notes: ['Notes', 'Commentaires']
  };

  async loadFromFile(filePath: string): Promise<ExcelLead[]> {
    try {
      const actualPath = filePath.includes('France - Special Quality package.xlsx') 
        ? '/Users/Apple/Desktop/lead_generator/France - Special Quality package.xlsx'
        : filePath;
      
      console.log('📁 Tentative lecture:', actualPath);
      const workbook = XLSX.readFile(actualPath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log('✅ Excel data loaded:', jsonData.length, 'rows');
      console.log('📋 Headers:', Object.keys(jsonData[0] || {}));
      
      if (jsonData.length === 0) {
        console.warn(' Aucune donnée trouvée dans le fichier');
        return [];
      }

      this.data = jsonData.map((row: any, index: number) => {
        const rowObj = row as Record<string, any>;
        const headers = Object.keys(rowObj);
        
        const lead: ExcelLead = {
          id: `excel-${index}`,
          name: this.getCellValue(rowObj, headers, this.columnMapping.name) || '',
          address: this.getCellValue(rowObj, headers, this.columnMapping.address) || '',
          phone: this.getCellValue(rowObj, headers, this.columnMapping.phone),
          email: this.getCellValue(rowObj, headers, this.columnMapping.email),
          website: this.getCellValue(rowObj, headers, this.columnMapping.website),
          category: this.getCellValue(rowObj, headers, this.columnMapping.category),
          city: this.getCellValue(rowObj, headers, this.columnMapping.city),
          postalCode: this.getCellValue(rowObj, headers, this.columnMapping.postalCode),
          department: this.getCellValue(rowObj, headers, this.columnMapping.department),
          region: this.getCellValue(rowObj, headers, this.columnMapping.region),
          manager: this.getCellValue(rowObj, headers, this.columnMapping.manager),
          employees: this.getCellValue(rowObj, headers, this.columnMapping.employees),
          revenue: this.getCellValue(rowObj, headers, this.columnMapping.revenue),
          siret: this.getCellValue(rowObj, headers, this.columnMapping.siret),
          naf: this.getCellValue(rowObj, headers, this.columnMapping.naf),
          rating: this.parseRating(this.getCellValue(rowObj, headers, this.columnMapping.rating)),
          notes: this.getCellValue(rowObj, headers, this.columnMapping.notes)
        };

        lead.department = lead.department || this.extractDepartmentFromPostalCode(lead.postalCode || '');
        lead.region = lead.region || this.getRegionFromDepartment(lead.department || '');

        return lead;
      });

      console.log('Processed data sample:', this.data.slice(0, 3));
      return this.data;
    } catch (error) {
      console.error('Erreur lors du chargement du fichier Excel:', error);
      throw new Error('Impossible de lire le fichier Excel');
    }
  }

  filterData(filters: ExcelFilters): ExcelLead[] {
    return this.data.filter(lead => {
      if (filters.category && lead.category !== filters.category) return false;
      if (filters.city && !lead.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.department && !lead.department?.toLowerCase().includes(filters.department.toLowerCase())) return false;
      if (filters.region && !lead.region?.toLowerCase().includes(filters.region.toLowerCase())) return false;
      if (filters.hasPhone && !lead.phone) return false;
      if (filters.hasEmail && !lead.email) return false;
      if (filters.hasWebsite && !lead.website) return false;
      if (filters.minRating && (lead.rating || 0) < filters.minRating) return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchable = `${lead.name} ${lead.address} ${lead.category} ${lead.city}`.toLowerCase();
        if (!searchable.includes(searchLower)) return false;
      }
      return true;
    });
  }

  getUniqueValues(field: keyof ExcelLead): string[] {
    const values = this.data.map(lead => lead[field] as string | undefined);
    const filteredValues = values.filter(Boolean) as string[];
    return Array.from(new Set(filteredValues)).sort();
  }

  exportToCSV(leads: ExcelLead[]): string {
    const headers = [
      'Nom',
      'Adresse',
      'Téléphone',
      'Email',
      'Site web',
      'Catégorie',
      'Ville',
      'Code postal',
      'Département',
      'Région',
      'Gérant',
      'Employés',
      'CA',
      'SIRET',
      'NAF',
      'Note'
    ];

    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.name,
        lead.address,
        lead.phone || '',
        lead.email || '',
        lead.website || '',
        lead.category || '',
        lead.city || '',
        lead.postalCode || '',
        lead.department || '',
        lead.region || '',
        lead.manager || '',
        lead.employees || '',
        lead.revenue || '',
        lead.siret || '',
        lead.naf || '',
        lead.rating?.toString() || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  private getCellValue(row: Record<string, any>, headers: string[], possibleNames: string[]): string | undefined {
    for (const name of possibleNames) {
      const key = headers.find(h => h.toLowerCase().includes(name.toLowerCase()));
      if (key && row[key]) {
        return String(row[key]).trim();
      }
    }
    return undefined;
  }

  private parseRating(ratingStr?: string): number | undefined {
    if (!ratingStr) return undefined;
    const rating = parseFloat(ratingStr.toString().replace(',', '.'));
    return isNaN(rating) ? undefined : rating;
  }

  private extractDepartmentFromPostalCode(postalCode: string): string {
    if (!postalCode) return '';
    const code = postalCode.toString().substring(0, 2);
    const departments: { [key: string]: string } = {
      '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
      '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
      '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
      '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
      '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
      '2B': 'Haute-Corse', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse',
      '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
      '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
      '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
      '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
      '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
      '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
      '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
      '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
      '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
      '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
      '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
      '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
      '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
      '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
      '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
      '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
      '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
      '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
      '95': 'Val-d\'Oise', '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
      '974': 'La Réunion', '976': 'Mayotte'
    };
    return departments[code] || '';
  }

  private getRegionFromDepartment(department: string): string {
    if (!department) return '';
    
    const regions: { [key: string]: string[] } = {
      'Île-de-France': ['75', '77', '78', '91', '92', '93', '94', '95'],
      'Auvergne-Rhône-Alpes': ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'],
      'Bourgogne-Franche-Comté': ['21', '25', '39', '58', '70', '71', '89', '90'],
      'Bretagne': ['22', '29', '35', '56'],
      'Centre-Val de Loire': ['18', '28', '36', '37', '41', '45'],
      'Corse': ['2A', '2B'],
      'Grand Est': ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'],
      'Hauts-de-France': ['02', '59', '60', '62', '80'],
      'Normandie': ['14', '27', '50', '61', '76'],
      'Nouvelle-Aquitaine': ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'],
      'Occitanie': ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'],
      'Pays de la Loire': ['44', '49', '53', '72', '85'],
      'Provence-Alpes-Côte d\'Azur': ['04', '05', '06', '13', '83', '84'],
      'Guadeloupe': ['971'],
      'Martinique': ['972'],
      'Guyane': ['973'],
      'La Réunion': ['974'],
      'Mayotte': ['976']
    };

    for (const [region, deps] of Object.entries(regions)) {
      if (deps.some(dep => department.includes(dep))) {
        return region;
      }
    }
    return '';
  }
}
