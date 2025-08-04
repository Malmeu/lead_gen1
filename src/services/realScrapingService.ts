import axios from 'axios';
import * as cheerio from 'cheerio';
import { Lead, SearchFilters } from '@/types';

export class RealScrapingService {
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, maxRetries = 3): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        return response.data;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.delay(1000 * (i + 1));
      }
    }
    throw new Error('Max retries reached');
  }

  async searchLeads(filters: SearchFilters): Promise<Lead[]> {
    return this.scrapeSocieteCom(filters);
  }

  private async scrapeSocieteCom(filters: SearchFilters): Promise<Lead[]> {
    const { category, location, maxResults = 50 } = filters;
    console.log(`Scraping societe.com pour ${category} à ${location}...`);
    
    // Données simulées pour le moment
    const mockData = this.generateMockData(category, location);
    return mockData.slice(0, maxResults);
  }

  private generateMockData(category: string, location: string): Lead[] {
    const mockNames = [
      'Le Petit Bistrot',
      'La Brasserie Parisienne',
      'Chez Antoine',
      'Bistro Moderne',
      'Cuisine Traditionnelle',
      'Restaurant du Port',
      'Café de la Paix',
      'Brasserie Centrale'
    ];

    return mockNames.map((name, index) => ({
      id: `mock_${Date.now()}_${index}`,
      name,
      address: `${Math.floor(Math.random() * 999) + 1} rue de ${location}`,
      phone: `01${Math.floor(Math.random() * 89999999) + 10000000}`,
      email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      website: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
      rating: Math.floor(Math.random() * 5) + 1,
      reviewCount: Math.floor(Math.random() * 100) + 1,
      category,
      coordinates: {
        lat: 48.8566 + (Math.random() - 0.5) * 0.1,
        lng: 2.3522 + (Math.random() - 0.5) * 0.1
      },
      placeId: `place_${index}`,
      status: 'new' as const
    }));
  }

  async exportToCSV(leads: Lead[]): Promise<string> {
    const headers = [
      'Nom',
      'Adresse',
      'Téléphone',
      'Email',
      'Site web',
      'Catégorie',
      'Note',
      'Nombre avis'
    ];

    const rows = leads.map(lead => [
      lead.name,
      lead.address,
      lead.phone || '',
      lead.email || '',
      lead.website || '',
      lead.category,
      lead.rating?.toString() || '',
      lead.reviewCount?.toString() || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}
