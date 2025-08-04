import axios from 'axios';
import { Lead, SearchFilters } from '@/types';

export class ScrapingService {
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractPhoneNumber(text: string): string | undefined {
    const phoneRegex = /(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}/g;
    const matches = text.match(phoneRegex);
    return matches ? matches[0] : undefined;
  }

  private extractEmail(text: string): string | undefined {
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : undefined;
  }

  private extractWebsite(text: string): string | undefined {
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?/g;
    const matches = text.match(urlRegex);
    return matches ? (matches[0].startsWith('http') ? matches[0] : `https://${matches[0]}`) : undefined;
  }

  // Scraping Pages Jaunes
  private async scrapePagesJaunes(filters: SearchFilters): Promise<Lead[]> {
    try {
      const searchQuery = `${filters.category} ${filters.location}`.replace(/\s+/g, '+');
      const url = `https://www.pagesjaunes.fr/recherche/${filters.location}/${filters.category}`;
      
      // Simulation de scraping (à remplacer par une vraie implémentation)
      console.log(`Scraping Pages Jaunes: ${url}`);
      
      // Données simulées pour la démonstration
      return this.generateMockData(filters, 'Pages Jaunes');
    } catch (error) {
      console.error('Error scraping Pages Jaunes:', error);
      return [];
    }
  }

  // Scraping Societe.com
  private async scrapeSocieteCom(filters: SearchFilters): Promise<Lead[]> {
    try {
      const searchQuery = `${filters.category} ${filters.location}`.replace(/\s+/g, '+');
      const url = `https://www.societe.com/cgi-bin/search?champs=${searchQuery}`;
      
      console.log(`Scraping Societe.com: ${url}`);
      
      return this.generateMockData(filters, 'Societe.com');
    } catch (error) {
      console.error('Error scraping Societe.com:', error);
      return [];
    }
  }

  // Scraping Kompass
  private async scrapeKompass(filters: SearchFilters): Promise<Lead[]> {
    try {
      const searchQuery = `${filters.category} ${filters.location}`.replace(/\s+/g, '+');
      const url = `https://fr.kompass.com/searchCompanies?text=${searchQuery}`;
      
      console.log(`Scraping Kompass: ${url}`);
      
      return this.generateMockData(filters, 'Kompass');
    } catch (error) {
      console.error('Error scraping Kompass:', error);
      return [];
    }
  }

  // Scraping Restaurants de France
  private async scrapeRestaurantsFrance(filters: SearchFilters): Promise<Lead[]> {
    try {
      if (!filters.category.toLowerCase().includes('restaurant')) {
        return [];
      }
      
      const url = `https://restaurants-de-france.fr/recherche?ville=${filters.location}`;
      
      console.log(`Scraping Restaurants de France: ${url}`);
      
      return this.generateMockData(filters, 'Restaurants de France');
    } catch (error) {
      console.error('Error scraping Restaurants de France:', error);
      return [];
    }
  }

  // Scraping Indexa
  private async scrapeIndexa(filters: SearchFilters): Promise<Lead[]> {
    try {
      const searchQuery = `${filters.category} ${filters.location}`.replace(/\s+/g, '+');
      const url = `https://indexa.fr/recherche?q=${searchQuery}`;
      
      console.log(`Scraping Indexa: ${url}`);
      
      return this.generateMockData(filters, 'Indexa');
    } catch (error) {
      console.error('Error scraping Indexa:', error);
      return [];
    }
  }

  // Génération de données mock pour la démonstration
  private generateMockData(filters: SearchFilters, source: string): Lead[] {
    const mockData: Lead[] = [];
    const categories = {
      'Restaurant': ['Le Petit Bistrot', 'La Belle Époque', 'Chez Marcel', 'Bistro Moderne', 'Cuisine Tradition'],
      'Bar': ['Le Comptoir', 'Bar de la Gare', 'Café Central', 'Le Zinc', 'Bar Sportif'],
      'Café': ['Café de Flore', 'Brasserie Lipp', 'Café des Arts', 'Salon de Thé', 'Coffee Shop'],
      'Boulangerie': ['Boulangerie Artisanale', 'Pain & Tradition', 'La Maison du Pain', 'Au Bon Pain', 'Boulanger Moderne'],
      'Hôtel': ['Hôtel de Ville', 'Grand Hôtel', 'Hôtel Moderne', 'Auberge du Coin', 'Hôtel Élégant']
    };

    const baseNames = categories[filters.category as keyof typeof categories] || categories['Restaurant'];
    const count = Math.min(filters.maxResults || 50, 25);

    for (let i = 0; i < count; i++) {
      const baseName = baseNames[i % baseNames.length];
      const suffix = source === 'Pages Jaunes' ? 'PJ' : source === 'Societe.com' ? 'SC' : source === 'Kompass' ? 'KP' : 'RF';
      
      mockData.push({
        id: `mock_${source.toLowerCase().replace(/\s+/g, '_')}_${i}`,
        name: `${baseName} ${suffix}`,
        address: `${Math.floor(Math.random() * 999) + 1} rue de ${filters.location}, ${Math.floor(Math.random() * 90000) + 10000} ${filters.location}`,
        phone: `0${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `contact@${baseName.toLowerCase().replace(/\s+/g, '')}.fr`,
        website: `https://www.${baseName.toLowerCase().replace(/\s+/g, '')}.fr`,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 200) + 10,
        category: filters.category,
        coordinates: {
          lat: 48.8566 + (Math.random() - 0.5) * 0.1,
          lng: 2.3522 + (Math.random() - 0.5) * 0.1
        },
        placeId: `mock_place_${i}`,
        lastUpdated: new Date(),
        status: 'new',
        notes: `Source: ${source}`
      });
    }

    return mockData;
  }

  public async searchLeads(filters: SearchFilters): Promise<Lead[]> {
    try {
      console.log('Starting scraping with filters:', filters);
      
      const allLeads: Lead[] = [];
      const sources = [
        this.scrapePagesJaunes(filters),
        this.scrapeSocieteCom(filters),
        this.scrapeKompass(filters),
        this.scrapeRestaurantsFrance(filters),
        this.scrapeIndexa(filters)
      ];

      // Exécuter tous les scrapings en parallèle avec délai pour éviter le rate limiting
      for (const sourcePromise of sources) {
        await this.delay(1000); // 1 seconde entre chaque source
        const sourceLeads = await sourcePromise;
        allLeads.push(...sourceLeads);
      }

      // Supprimer les doublons basés sur le nom et l'adresse
      const uniqueLeads = allLeads.filter((lead, index, self) =>
        index === self.findIndex(l => 
          l.name === lead.name && l.address === lead.address
        )
      );

      return uniqueLeads.slice(0, filters.maxResults || 50);
    } catch (error) {
      console.error('Error in searchLeads:', error);
      throw new Error('Erreur lors du scraping des données');
    }
  }

  public async exportToCSV(leads: Lead[]): Promise<string> {
    const headers = [
      'Nom',
      'Adresse',
      'Téléphone',
      'Email',
      'Site web',
      'Note',
      'Nombre d\'avis',
      'Catégorie',
      'Latitude',
      'Longitude',
      'Statut',
      'Notes',
      'Source'
    ];

    const rows = leads.map(lead => [
      lead.name,
      lead.address,
      lead.phone || '',
      lead.email || '',
      lead.website || '',
      lead.rating || '',
      lead.reviewCount || '',
      lead.category,
      lead.coordinates.lat,
      lead.coordinates.lng,
      lead.status,
      lead.notes || '',
      lead.notes?.includes('Source:') ? lead.notes.split('Source:')[1]?.trim() || '' : ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}
