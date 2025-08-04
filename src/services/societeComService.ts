import axios from 'axios';
import * as cheerio from 'cheerio';
import { Lead, SearchFilters } from '@/types';

export class SocieteComService {
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: 10000,
        });
        return response.data;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.delay(2000 * (i + 1));
      }
    }
  }

  public async searchLeads(filters: SearchFilters): Promise<Lead[]> {
    const { category, location, maxResults = 50, includeManager } = filters;
    
    console.log(`Scraping societe.com pour ${category} à ${location}...`);
    const leads = await this.scrapeSocieteCom(category, location, maxResults, includeManager);
    
    return leads.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, maxResults);
  }

  private async scrapeSocieteCom(category: string, location: string, maxResults: number, includeManager?: boolean): Promise<Lead[]> {
    // Pour l'instant, retourner des données mock
    // TODO: Implémenter le scraping réel de societe.com
    return this.generateSocieteComData(category, location, maxResults, includeManager);
  }

  private generateSocieteComData(category: string, location: string, maxResults: number, includeManager?: boolean): Lead[] {
    const leads: Lead[] = [];
    const count = Math.min(15, maxResults);
    
    const companyNames = {
      'restaurant': ['Le Bistrot', 'Restaurant Gastronomique', 'Brasserie Parisienne', 'Café de la Paix', 'Bistrot Moderne'],
      'bar': ['Bar Lounge', 'Café Bar', 'Wine Bar', 'Pub Irlandais', 'Bar à Cocktails'],
      'café': ['Café des Arts', 'Salon de Thé', 'Café Gourmand', 'Brasserie du Matin', 'Café des Sports'],
      'hôtel': ['Hôtel du Parc', 'Hôtel de Luxe', 'Hôtel Restaurant', 'Auberge', 'Hôtel Centre Ville'],
      'boulangerie': ['Boulangerie Artisanale', 'Pâtisserie Française', 'Boulangerie Bio', 'Maison du Pain', 'Artisan Boulanger'],
      'coiffeur': ['Salon de Coiffure', 'Coiffeur Mixte', 'Institut de Beauté', 'Salon Coiffure Homme', 'Coiffure Femme'],
      'esthéticienne': ['Institut de Beauté', 'Salon Esthétique', 'Spa Beauté', 'Centre Bien-être', 'Cabinet Esthétique'],
      'auto-école': ['Auto-école Paris', 'Permis de Conduire', 'Conduite Accompagnée', 'Auto Moto École', 'Permis Express'],
      'plombier': ['Plombier Artisan', 'Dépannage Plomberie', 'Plombier Chauffagiste', 'Urgence Plombier', 'Artisan Plombier'],
      'électricien': ['Électricien Général', 'Électricité Bâtiment', 'Dépannage Électricité', 'Installation Électrique', 'Artisan Électricien'],
      'artisan': ['Artisan Bâtiment', 'Entreprise Artisanale', 'Artisan du Bâtiment', 'Compagnons du Devoir', 'Maître Artisan'],
      'commerçant': ['Commerçant Indépendant', 'Magasin Indépendant', 'Commerçant de Proximité', 'Boutique Artisanale', 'Commerçant Local']
    };

    const managerNames = [
      'Jean Dupont', 'Marie Martin', 'Pierre Bernard', 'Sophie Durand', 'Lucas Moreau',
      'Emma Laurent', 'Thomas Petit', 'Camille Robert', 'Alexandre Michel', 'Julie Garcia',
      'Nicolas Martinez', 'Claire Simon', 'Antoine Lefèvre', 'Laura Rousseau', 'David Vincent',
      'Sarah Leroy', 'Julien Fournier', 'Amélie Girard', 'Mathieu André', 'Céline Rousseau'
    ];

    for (let i = 0; i < count; i++) {
      const names = companyNames[category as keyof typeof companyNames] || companyNames.restaurant;
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomNum = Math.floor(Math.random() * 100);
      const managerName = includeManager ? managerNames[Math.floor(Math.random() * managerNames.length)] : undefined;
      
      leads.push({
        id: `societe-${i}`,
        name: `${randomName} ${randomNum}`,
        address: `${Math.floor(Math.random() * 200) + 1} ${['Rue', 'Avenue', 'Boulevard'][Math.floor(Math.random() * 3)]} de ${location}`,
        phone: `01${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}`,
        website: `https://www.${randomName.toLowerCase().replace(/\s+/g, '-')}-${randomNum}.fr`,
        email: `contact@${randomName.toLowerCase().replace(/\s+/g, '')}${randomNum}.fr`,
        category: category,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 200) + 10,
        status: 'new' as const,
        notes: includeManager && managerName ? `Gérant: ${managerName}` : '',
        manager: includeManager ? managerName : undefined,
        coordinates: {
          lat: 48.8566 + (Math.random() - 0.5) * 0.1,
          lng: 2.3522 + (Math.random() - 0.5) * 0.1
        },
        placeId: `societe_${Date.now()}_${i}`
      });
    }
    
    return leads;
  }

  public async exportToCSV(leads: Lead[]): Promise<string> {
    const headers = [
      'Nom',
      'Adresse',
      'Téléphone',
      'Email',
      'Site web',
      'Catégorie',
      'Note',
      'Nombre avis',
      'Gérant'
    ];

    const rows = leads.map(lead => [
      lead.name,
      lead.address,
      lead.phone || '',
      lead.email || '',
      lead.website || '',
      lead.category,
      lead.rating?.toString() || '',
      lead.reviewCount?.toString() || '',
      lead.manager || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}
