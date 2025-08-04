import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ExcelRow {
  id: string;
  companyName: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  department?: string;
  region?: string;
  [key: string]: any;
}

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 2rem;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const FilterContainer = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  color: #374151;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  color: #374151;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: #374151;
`;

const ResultsContainer = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ResultsCount = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
`;

const LeadCard = styled(motion.div)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const LeadTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
`;

const LeadDetail = styled.p`
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 0.25rem;

  &.category {
    color: #667eea;
    font-weight: 600;
  }

  &.location {
    color: #6b7280;
  }

  &.contact {
    color: #059669;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: white;
  font-size: 1.2rem;
`;

const ErrorContainer = styled.div`
  text-align: center;
  color: #ef4444;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #667eea;
  color: white;
  margin: 0 0.5rem;

  &:hover {
    background: #5a6fd8;
    transform: translateY(-1px);
  }
`;

export default function ExcelExplorer() {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [filteredData, setFilteredData] = useState<ExcelRow[]>([]);
  const [displayData, setDisplayData] = useState<ExcelRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    department: '',
    region: '',
    hasPhone: false,
    hasEmail: false,
    hasWebsite: false
  });

  const [uniqueValues, setUniqueValues] = useState({
    categories: [] as string[],
    cities: [] as string[],
    departments: [] as string[],
    regions: [] as string[]
  });

  useEffect(() => {
    applyFilters();
  }, [data, filters]);

  useEffect(() => {
    // Pagination des données filtrées
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage]);

  // Chargement optimisé avec fallback vers données allégées
  const loadJsonData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Tentative de chargement des données...');
      
      // D'abord essayer le fichier allégé
      try {
        const lightResponse = await fetch('/prospects-data-light.json');
        if (lightResponse.ok) {
          const jsonData = await lightResponse.json();
          console.log('✅ Données allégées chargées:', jsonData?.length || 0, 'éléments');
          processAndSetData(jsonData);
          return;
        }
      } catch (lightError) {
        console.log('ℹ️ Fichier allégé non trouvé, chargement du fichier complet...');
      }
      
      // Fallback vers le fichier complet
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch('/prospects-data.json', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      console.log(' Données complètes chargées:', jsonData?.length || 0, 'éléments');
      
      if (!Array.isArray(jsonData)) {
        throw new Error('Le fichier JSON doit contenir un tableau d\'objets');
      }
      
      processAndSetData(jsonData);
    } catch (err) {
      console.error(' Erreur chargement JSON:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const processAndSetData = (jsonData: any[]) => {
    const processedData = jsonData.map((row: Record<string, unknown>, index: number) => {
      const postalCode = String(row['[Zip]'] || row['Zip'] || row['zip'] || row['postalCode'] || '');
      let department = String(row['[Department]'] || row['Department'] || row['department'] || '');
      let region = String(row['[Region]'] || row['Region'] || row['region'] || '');

      if (!department && postalCode) {
        department = postalCode.substring(0, 2);
      }

      if (department && !region) {
        const deptToRegion: { [key: string]: string } = {
          '75': 'Île-de-France', '77': 'Île-de-France', '78': 'Île-de-France', '91': 'Île-de-France', '92': 'Île-de-France', '93': 'Île-de-France', '94': 'Île-de-France', '95': 'Île-de-France',
          '13': 'Provence-Alpes-Côte d\'Azur', '83': 'Provence-Alpes-Côte d\'Azur', '84': 'Provence-Alpes-Côte d\'Azur',
          '69': 'Auvergne-Rhône-Alpes', '01': 'Auvergne-Rhône-Alpes', '03': 'Auvergne-Rhône-Alpes', '07': 'Auvergne-Rhône-Alpes', '15': 'Auvergne-Rhône-Alpes',
          '33': 'Nouvelle-Aquitaine', '24': 'Nouvelle-Aquitaine', '40': 'Nouvelle-Aquitaine', '47': 'Nouvelle-Aquitaine',
          '59': 'Hauts-de-France', '62': 'Hauts-de-France', '02': 'Hauts-de-France', '60': 'Hauts-de-France', '80': 'Hauts-de-France',
          '44': 'Pays de la Loire', '85': 'Pays de la Loire', '49': 'Pays de la Loire', '53': 'Pays de la Loire', '72': 'Pays de la Loire',
          '29': 'Bretagne', '22': 'Bretagne', '35': 'Bretagne', '56': 'Bretagne'
        };
        region = deptToRegion[department] || 'France';
      }

      return {
        id: `json-${index}`,
        companyName: String(row['[Company Name]'] || row['Company Name'] || row['companyName'] || row['name'] || ''),
        address: String(row['[Street]'] || row['Street'] || row['address'] || row['street'] || ''),
        city: String(row['[City]'] || row['City'] || row['city'] || ''),
        postalCode: postalCode,
        phone: String(row['[Tel]'] || row['Tel'] || row['Phone'] || row['phone'] || '').trim() || undefined,
        email: String(row['[Email]'] || row['Email'] || row['email'] || '').trim() || undefined,
        website: String(row['[Website]'] || row['Website'] || row['website'] || '').trim() || undefined,
        category: String(row['[CATEGORY]'] || row['CATEGORY'] || row['category'] || '').trim() || undefined,
        department: department,
        region: region
      };
    }).filter(row => row.companyName && row.companyName.trim() !== '');

    setData(processedData);
    
    const uniqueCategories = Array.from(new Set(processedData.map((row: ExcelRow) => row.category).filter(Boolean))) as string[];
    const uniqueCities = Array.from(new Set(processedData.map((row: ExcelRow) => row.city).filter(Boolean))) as string[];
    const uniqueDepartments = Array.from(new Set(processedData.map((row: ExcelRow) => row.department).filter(Boolean))) as string[];
    const uniqueRegions = Array.from(new Set(processedData.map((row: ExcelRow) => row.region).filter(Boolean))) as string[];
    
    setUniqueValues({
      categories: uniqueCategories,
      cities: uniqueCities,
      departments: uniqueDepartments,
      regions: uniqueRegions
    });

    console.log(' Données traitées:', {
      total: processedData.length,
      categories: uniqueCategories.length,
      cities: uniqueCities.length,
      departments: uniqueDepartments.length,
      regions: uniqueRegions.length
    });
  };

  useEffect(() => {
    // Vérifier si on doit charger les données de test ou les données complètes
    const urlParams = new URLSearchParams(window.location.search);
    const useTestData = urlParams.get('test') === 'true';
    
    if (useTestData) {
      loadTestData();
    } else {
      loadJsonData();
    }
  }, []);

  const loadTestData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/test-data.json');
      if (!response.ok) throw new Error('Fichier de test non trouvé');
      
      const jsonData = await response.json();
      const processedData = jsonData.map((row: any, index: number) => ({
        id: `test-${index}`,
        companyName: String(row.companyName || ''),
        address: String(row.address || ''),
        city: String(row.city || ''),
        postalCode: String(row.postalCode || ''),
        phone: String(row.phone || '').trim() || undefined,
        email: String(row.email || '').trim() || undefined,
        website: String(row.website || '').trim() || undefined,
        category: String(row.category || '').trim() || undefined,
        department: String(row.postalCode || '').substring(0, 2),
        region: 'Test'
      })).filter((row: ExcelRow) => row.companyName && row.companyName.trim() !== '');

      setData(processedData);
      setUniqueValues({
        categories: Array.from(new Set(processedData.map((row: ExcelRow) => row.category).filter(Boolean))) as string[],
        cities: Array.from(new Set(processedData.map((row: ExcelRow) => row.city).filter(Boolean))) as string[],
        departments: Array.from(new Set(processedData.map((row: ExcelRow) => row.department).filter(Boolean))) as string[],
        regions: Array.from(new Set(processedData.map((row: ExcelRow) => row.region).filter(Boolean))) as string[]
      });

      console.log('✅ Données de test chargées:', processedData.length, 'prospects');
    } catch (err) {
      console.error('❌ Erreur chargement données test:', err);
      setError('Erreur lors du chargement des données de test');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(row =>
        row.companyName.toLowerCase().includes(searchTerm) ||
        row.category?.toLowerCase().includes(searchTerm) ||
        row.city.toLowerCase().includes(searchTerm) ||
        row.address.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(row => row.category === filters.category);
    }

    if (filters.city) {
      filtered = filtered.filter(row => row.city === filters.city);
    }

    if (filters.department) {
      filtered = filtered.filter(row => row.department === filters.department);
    }

    if (filters.region) {
      filtered = filtered.filter(row => row.region === filters.region);
    }

    if (filters.hasPhone) {
      filtered = filtered.filter(row => row.phone && row.phone.trim() !== '');
    }

    if (filters.hasEmail) {
      filtered = filtered.filter(row => row.email && row.email.trim() !== '');
    }

    if (filters.hasWebsite) {
      filtered = filtered.filter(row => row.website && row.website.trim() !== '');
    }

    setFilteredData(filtered);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      department: '',
      region: '',
      hasPhone: false,
      hasEmail: false,
      hasWebsite: false
    });
  };

  const exportToCSV = () => {
    const headers = ['Entreprise', 'Adresse', 'Ville', 'Code Postal', 'Téléphone', 'Email', 'Site Web', 'Catégorie', 'Département', 'Région'];
    const rows = filteredData.map(row => [
      row.companyName,
      row.address,
      row.city,
      row.postalCode,
      row.phone || '',
      row.email || '',
      row.website || '',
      row.category || '',
      row.department || '',
      row.region || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'prospects-filtres.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const FileUploadContainer = styled(motion.div)`
    background: white;
    border-radius: 1rem;
    padding: 3rem;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  `;

  const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1rem;
  `;

  const PaginationButton = styled.button`
    padding: 0.5rem 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: #5a6fd8;
      transform: translateY(-1px);
    }

    &:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
      transform: none;
    }
  `;

  const PaginationInfo = styled.span`
    color: white;
    font-weight: 600;
  `;

  const FileInput = styled.input`
    display: none;
  `;

  const UploadButton = styled.label`
    display: inline-block;
    padding: 1rem 2rem;
    background: #667eea;
    color: white;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-top: 1rem;

    &:hover {
      background: #5a6fd8;
      transform: translateY(-1px);
    }
  `;

  if (loading) {
    return (
      <PageContainer>
        <ContentContainer>
          <Header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Title>Explorateur Excel</Title>
            <Subtitle>
              Chargement des données...
            </Subtitle>
          </Header>
          
          <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
            <div>Chargement des prospects...</div>
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ContentContainer>
          <Header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Title>Explorateur Excel</Title>
            <Subtitle>
              Erreur lors du chargement
            </Subtitle>
          </Header>

          <FileUploadContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2>❌ Erreur</h2>
            <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>
            <button 
              onClick={loadJsonData}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔄 Réessayer
            </button>
          </FileUploadContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <PageContainer>
        <ContentContainer>
          <Header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Title>Explorateur Excel</Title>
            <Subtitle>
              Importez votre fichier Excel pour explorer et filtrer vos prospects
            </Subtitle>
          </Header>

          <FileUploadContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2>Importer votre fichier Excel</h2>
            <p>Chargez votre fichier "France - Special Quality package.xlsx" ou tout autre fichier de prospects</p>
            <p>📁 Le fichier JSON prospects-data.json est chargé automatiquement</p>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Pour utiliser vos propres données, convertissez votre Excel en JSON et remplacez le fichier prospects-data.json
            </p>
            {error && (
              <div style={{ color: '#ef4444', marginTop: '1rem' }}>
                {error}
              </div>
            )}
          </FileUploadContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            Chargement du fichier Excel...
          </motion.div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer>
        <Header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title>Explorateur Excel</Title>
          <Subtitle>
            Recherche et filtrage des prospects depuis "France - Special Quality package.xlsx"
          </Subtitle>
        </Header>

        <FilterContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FilterGrid>
            <FilterGroup>
              <Label>Recherche globale</Label>
              <Input
                type="text"
                placeholder="Nom, adresse, catégorie..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Catégorie</Label>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Toutes catégories</option>
                {uniqueValues.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Ville</Label>
              <Select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              >
                <option value="">Toutes villes</option>
                {uniqueValues.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Département</Label>
              <Select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">Tous départements</option>
                {uniqueValues.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Région</Label>
              <Select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="">Toutes régions</option>
                {uniqueValues.regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </Select>
            </FilterGroup>
          </FilterGrid>

          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={filters.hasPhone}
                onChange={(e) => handleFilterChange('hasPhone', e.target.checked)}
              />
              Avec téléphone
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={filters.hasEmail}
                onChange={(e) => handleFilterChange('hasEmail', e.target.checked)}
              />
              Avec email
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={filters.hasWebsite}
                onChange={(e) => handleFilterChange('hasWebsite', e.target.checked)}
              />
              Avec site web
            </CheckboxLabel>
          </CheckboxGroup>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <Button onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </div>
        </FilterContainer>

        <ResultsContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ResultsHeader>
            <ResultsCount>
              {filteredData.length} prospect{filteredData.length !== 1 ? 's' : ''} trouvé{filteredData.length !== 1 ? 's' : ''}
              {filteredData.length > itemsPerPage && ` (affichage ${displayData.length} sur ${filteredData.length})`}
            </ResultsCount>
            <div>
              <Button onClick={() => window.location.reload()} style={{ marginRight: '0.5rem' }}>
                🔄 Rafraîchir
              </Button>
              <Button onClick={exportToCSV}>
                📊 Exporter CSV ({filteredData.length})
              </Button>
            </div>
          </ResultsHeader>

          <ResultsGrid>
            {displayData.map((row, index) => (
              <LeadCard
                key={row.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <LeadTitle>{row.companyName}</LeadTitle>
                <LeadDetail className="category">{row.category || 'Non défini'}</LeadDetail>
                <LeadDetail className="location">
                  {row.address}, {row.postalCode} {row.city}
                </LeadDetail>
                <LeadDetail className="location">
                  {row.department && `${row.department}, `}{row.region}
                </LeadDetail>
                {row.phone && <LeadDetail className="contact">📞 {row.phone}</LeadDetail>}
                {row.email && <LeadDetail className="contact">📧 {row.email}</LeadDetail>}
                {row.website && <LeadDetail className="contact">🌐 {row.website}</LeadDetail>}
              </LeadCard>
            ))}
          </ResultsGrid>

          {filteredData.length > itemsPerPage && (
            <PaginationContainer>
              <PaginationButton 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Précédent
              </PaginationButton>
              
              <PaginationInfo>
                Page {currentPage} sur {Math.ceil(filteredData.length / itemsPerPage)}
              </PaginationInfo>
              
              <PaginationButton 
                onClick={() => setCurrentPage(Math.min(Math.ceil(filteredData.length / itemsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
              >
                Suivant →
              </PaginationButton>
            </PaginationContainer>
          )}
        </ResultsContainer>
      </ContentContainer>
    </PageContainer>
  );
}
