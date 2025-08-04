export interface Lead {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category: string;
  subcategory?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId: string;
  photos?: string[];
  openingHours?: string[];
  priceLevel?: number;
  lastUpdated?: Date;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  notes?: string;
  createdAt?: string;
  manager?: string;
}

export interface SearchFilters {
  category: string;
  location: string;
  radius: number;
  keywords?: string[];
  minRating?: number;
  maxResults?: number;
  includeManager?: boolean;
}

export interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  filters: SearchFilters;
  results: Lead[];
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    html_attributions: string[];
  }>;
  opening_hours?: {
    weekday_text: string[];
  };
  price_level?: number;
}
