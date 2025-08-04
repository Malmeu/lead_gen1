import React, { useState, useEffect, useMemo } from 'react';
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
  department: string;
  region: string;
}

interface UniqueValues {
  categories: string[];
  cities: string[];
  departments: string[];
  regions: string[];
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Header = styled.h1`
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
`;

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
`;

const FilterInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem;
  color: #e74c3c;
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ResultsCount = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
`;

const Th = styled.th`
  background: #667eea;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

export default function ExcelExplorer() {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [filteredData, setFilteredData] = useState<ExcelRow[]>([]);
  const [displayData, setDisplayData] = useState<ExcelRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uniqueValues, setUniqueValues] = useState<UniqueValues>({
    categories: [],
    cities: [],
    departments: [],
    regions: []
  });

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

  // Process and set data
  const processAndSetData = (jsonData: any[]) => {
    if (!Array.isArray(jsonData)) {
      console.error('❌ Les données ne sont pas un tableau valide');
      setError('Format de données invalide');
      return;
    }

    const processedData = jsonData.map((row: any, index: number) => {
      const postalCode = String(row['Zip'] || row['postalCode'] || row['zip'] || '');
      const department = postalCode.substring(0, 2);
      
      return {
        id: `json-${index}`,
        companyName: String(row['Company Name'] || row['companyName'] || row['name'] || ''),
        address: String(row['Street'] || row['address'] || row['street'] || ''),
        city: String(row['City'] || row['city'] || ''),
        postalCode: postalCode,
        phone: String(row['Tel'] || row['phone'] || '').trim() || undefined,
        email: String(row['Email'] || row['email'] || '').trim() || undefined,
        website: String(row['Website'] || row['website'] || '').trim() || undefined,
        category: String(row['CATEGORY'] || row['category'] || '').trim() || undefined,
        department: department,
        region: String(row['Region'] || row['region'] || getRegionFromDepartment(department))
      };
    }).filter(row => row.companyName && row.companyName.trim() !== '');

    setData(processedData);
    
    // Extraire les valeurs uniques pour les filtres
    const categories = Array.from(new Set(processedData.map(row => row.category).filter(Boolean))) as string[];
    const cities = Array.from(new Set(processedData.map(row => row.city).filter(Boolean))) as string[];
    const departments = Array.from(new Set(processedData.map(row => row.department).filter(Boolean))) as string[];
    const regions = Array.from(new Set(processedData.map(row => row.region).filter(Boolean))) as string[];
    
    setUniqueValues({ categories, cities, departments, regions });
    console.log('✅ Données traitées:', processedData.length, 'prospects');
  };

  // Fonction pour obtenir la région depuis le département
  const getRegionFromDepartment = (department: string): string => {
    const deptMap: { [key: string]: string } = {
      '01': 'Auvergne-Rhône-Alpes', '03': 'Auvergne-Rhône-Alpes', '07': 'Auvergne-Rhône-Alpes',
      '15': 'Auvergne-Rhône-Alpes', '26': 'Auvergne-Rhône-Alpes', '38': 'Auvergne-Rhône-Alpes',
      '42': 'Auvergne-Rhône-Alpes', '43': 'Auvergne-Rhône-Alpes', '63': 'Auvergne-Rhône-Alpes',
      '69': 'Auvergne-Rhône-Alpes', '73': 'Auvergne-Rhône-Alpes', '74': 'Auvergne-Rhône-Alpes',
      '75': 'Île-de-France', '77': 'Île-de-France', '78': 'Île-de-France',
      '91': 'Île-de-France', '92': 'Île-de-France', '93': 'Île-de-France',
      '94': 'Île-de-France', '95': 'Île-de-France',
      '13': 'Provence-Alpes-Côte d\'Azur', '83': 'Provence-Alpes-Côte d\'Azur',
      '84': 'Provence-Alpes-Côte d\'Azur', '04': 'Provence-Alpes-Côte d\'Azur',
      '05': 'Provence-Alpes-Côte d\'Azur', '06': 'Provence-Alpes-Côte d\'Azur'
    };
    return deptMap[department] || 'Inconnu';
  };

  // Charger les données
  const loadJsonData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Tentative de chargement des données...');
      
      // Essayer d'abord le fichier léger
      try {
        const response = await fetch('/prospects-data-light.json');
        if (response.ok) {
          const jsonData = await response.json();
          if (jsonData && jsonData.length > 0) {
            console.log('✅ Données légeres chargées:', jsonData.length, 'éléments');
            processAndSetData(jsonData);
            return;
          }
        }
      } catch (lightError) {
        console.log('⚠️ Fichier léger non trouvé ou vide');
      }
      
      // Essayer le fichier complet
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch('/prospects-data.json', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const jsonData = await response.json();
          if (jsonData && jsonData.length > 0) {
            console.log('✅ Données complètes chargées:', jsonData.length, 'éléments');
            processAndSetData(jsonData);
            return;
          }
        }
      } catch (fullError) {
        console.log('⚠️ Fichier complet non trouvé ou vide');
      }
      
      // Fallback sur les données de test
      try {
        const response = await fetch('/sample-data.json');
        if (response.ok) {
          const jsonData = await response.json();
          if (jsonData && jsonData.length > 0) {
            console.log('✅ Données de test chargées:', jsonData.length, 'éléments');
            processAndSetData(jsonData);
            return;
          }
        }
      } catch (testError) {
        console.log('⚠️ Données de test non trouvées');
      }
      
      // Si aucun fichier n'a de données, créer des données de démonstration
      console.log('📝 Création de données de démonstration...');
      const demoData = [
        {
          "Company Name": "Le Bistrot Parisien",
          "Street": "123 Rue de la Paix",
          "City": "Paris",
          "Zip": "75001",
          "Tel": "01 23 45 67 89",
          "Email": "contact@bistrotparisien.fr",
          "Website": "www.bistrotparisien.fr",
          "CATEGORY": "Restaurant",
          "Department": "Paris",
          "Region": "Île-de-France"
        },
        {
          "Company Name": "Café de Lyon",
          "Street": "45 Avenue des Lumières",
          "City": "Lyon",
          "Zip": "69002",
          "Tel": "04 56 78 90 12",
          "Email": "info@cafedelyon.fr",
          "Website": "www.cafedelyon.fr",
          "CATEGORY": "Café",
          "Department": "Rhône",
          "Region": "Auvergne-Rhône-Alpes"
        },
        {
          "Company Name": "Brasserie Marseille",
          "Street": "78 Quai du Vieux Port",
          "City": "Marseille",
          "Zip": "13001",
          "Tel": "04 91 23 45 67",
          "Email": "brasserie@marseille.fr",
          "Website": "www.brasseriemarseille.fr",
          "CATEGORY": "Brasserie",
          "Department": "Bouches-du-Rhône",
          "Region": "Provence-Alpes-Côte d'Azur"
        }
      ];
      processAndSetData(demoData);
      
    } catch (err) {
      console.error('❌ Erreur chargement JSON:', err);
      setError('Aucune donnée disponible. Veuillez ajouter un fichier prospects-data.json ou prospects-data-light.json');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJsonData();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...data];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(row =>
        row.companyName.toLowerCase().includes(searchLower) ||
        row.address.toLowerCase().includes(searchLower) ||
        row.city.toLowerCase().includes(searchLower) ||
        (row.category && row.category.toLowerCase().includes(searchLower))
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
    setCurrentPage(1);
  }, [data, filters]);

  // Pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
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
    const csvContent = [
      ['Company Name', 'Address', 'City', 'Postal Code', 'Phone', 'Email', 'Website', 'Category', 'Department', 'Region'],
      ...filteredData.map(row => [
        row.companyName,
        row.address,
        row.city,
        row.postalCode,
        row.phone || '',
        row.email || '',
        row.website || '',
        row.category || '',
        row.department,
        row.region
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'prospects.csv';
    link.click();
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: 40, height: 40, border: '3px solid #667eea', borderTop: '3px solid transparent', borderRadius: '50%' }}
          />
          <p>Chargement des données...</p>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <h2>❌ Erreur de chargement</h2>
          <p>{error}</p>
          <button onClick={loadJsonData} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Réessayer
          </button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>Excel Explorer - Gestion des Prospects</Header>
      
      <FilterContainer>
        <FilterInput
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        
        <FilterSelect
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {uniqueValues.categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </FilterSelect>
        
        <FilterSelect
          value={filters.city}
          onChange={(e) => handleFilterChange('city', e.target.value)}
        >
          <option value="">Toutes villes</option>
          {uniqueValues.cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </FilterSelect>
        
        <FilterSelect
          value={filters.department}
          onChange={(e) => handleFilterChange('department', e.target.value)}
        >
          <option value="">Tous départements</option>
          {uniqueValues.departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </FilterSelect>
        
        <FilterSelect
          value={filters.region}
          onChange={(e) => handleFilterChange('region', e.target.value)}
        >
          <option value="">Toutes régions</option>
          {uniqueValues.regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </FilterSelect>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={filters.hasPhone}
              onChange={(e) => handleFilterChange('hasPhone', e.target.checked)}
            />
            Avec téléphone
          </label>
          <label style={{ fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={filters.hasEmail}
              onChange={(e) => handleFilterChange('hasEmail', e.target.checked)}
            />
            Avec email
          </label>
          <label style={{ fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={filters.hasWebsite}
              onChange={(e) => handleFilterChange('hasWebsite', e.target.checked)}
            />
            Avec site web
          </label>
        </div>
        
        <button onClick={resetFilters} style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
          Réinitialiser
        </button>
      </FilterContainer>

      <ResultsContainer>
        <ResultsHeader>
          <ResultsCount>
            {filteredData.length} prospect(s) trouvé(s)
          </ResultsCount>
          <button onClick={exportToCSV} style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Exporter CSV
          </button>
        </ResultsHeader>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Nom de l'entreprise</Th>
                <Th>Adresse</Th>
                <Th>Ville</Th>
                <Th>Code postal</Th>
                <Th>Téléphone</Th>
                <Th>Email</Th>
                <Th>Site web</Th>
                <Th>Catégorie</Th>
                <Th>Département</Th>
                <Th>Région</Th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.companyName}</Td>
                  <Td>{row.address}</Td>
                  <Td>{row.city}</Td>
                  <Td>{row.postalCode}</Td>
                  <Td>{row.phone || '-'}</Td>
                  <Td>{row.email || '-'}</Td>
                  <Td>{row.website || '-'}</Td>
                  <Td>{row.category || '-'}</Td>
                  <Td>{row.department}</Td>
                  <Td>{row.region}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <PaginationContainer>
            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </PaginationButton>
            
            <PageInfo>
              Page {currentPage} sur {totalPages}
            </PageInfo>
            
            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </PaginationButton>
          </PaginationContainer>
        )}
      </ResultsContainer>
    </Container>
  );
}
