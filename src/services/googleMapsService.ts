import axios from 'axios';
import { GooglePlace, Lead, SearchFilters } from '@/types';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

export class GoogleMapsService {
  private async geocodeLocation(location: string): Promise<{ lat: number; lng: number }> {
    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
        params: {
          address: location,
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.results.length === 0) {
        throw new Error('Location not found');
      }

      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode location');
    }
  }

  private async searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number,
    type: string,
    keyword?: string
  ): Promise<GooglePlace[]> {
    try {
      const params: any = {
        location: `${location.lat},${location.lng}`,
        radius,
        type,
        key: GOOGLE_MAPS_API_KEY,
      };

      if (keyword) {
        params.keyword = keyword;
      }

      const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json`, {
        params,
      });

      return response.data.results;
    } catch (error) {
      console.error('Places search error:', error);
      throw new Error('Failed to search places');
    }
  }

  private async getPlaceDetails(placeId: string): Promise<GooglePlace> {
    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types,geometry,photos,opening_hours,price_level',
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      return response.data.result;
    } catch (error) {
      console.error('Place details error:', error);
      throw new Error('Failed to get place details');
    }
  }

  public async searchLeads(filters: SearchFilters): Promise<Lead[]> {
    try {
      const location = await this.geocodeLocation(filters.location);
      const leads: Lead[] = [];

      // Types de lieux pertinents pour les entreprises françaises
      const relevantTypes = [
        'restaurant',
        'bar',
        'cafe',
        'bakery',
        'night_club',
        'hotel',
        'shopping_mall',
        'supermarket',
        'grocery_or_supermarket',
        'food',
        'establishment'
      ];

      for (const type of relevantTypes) {
        if (leads.length >= (filters.maxResults || 100)) break;

        const places = await this.searchNearbyPlaces(
          location,
          filters.radius,
          type,
          filters.keywords?.join(' ')
        );

        for (const place of places) {
          if (leads.length >= (filters.maxResults || 100)) break;

          // Filtrer par note minimale
          if (filters.minRating && (place.rating || 0) < filters.minRating) continue;

          // Obtenir les détails complets
          const details = await this.getPlaceDetails(place.place_id);

          const lead: Lead = {
            id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: details.name,
            address: details.formatted_address,
            phone: details.formatted_phone_number,
            email: this.extractEmailFromWebsite(details.website),
            website: details.website,
            rating: details.rating,
            reviewCount: details.user_ratings_total,
            category: filters.category,
            subcategory: type,
            coordinates: {
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
            },
            placeId: place.place_id,
            photos: details.photos?.map(photo => photo.photo_reference),
            openingHours: details.opening_hours?.weekday_text,
            priceLevel: details.price_level,
            lastUpdated: new Date(),
            status: 'new',
          };

          leads.push(lead);
        }
      }

      // Supprimer les doublons
      const uniqueLeads = leads.filter((lead, index, self) =>
        index === self.findIndex(l => l.placeId === lead.placeId)
      );

      return uniqueLeads.slice(0, filters.maxResults || 100);
    } catch (error) {
      console.error('Search leads error:', error);
      throw new Error('Failed to search leads');
    }
  }

  private extractEmailFromWebsite(website?: string): string | undefined {
    if (!website) return undefined;
    
    // Logique d'extraction d'email depuis le site web
    // Pour l'instant, retourne undefined - peut être implémenté avec un scraping réel
    return undefined;
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
      'Notes'
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
      lead.notes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}
