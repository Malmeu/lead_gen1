import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '@/styles/theme';
import { ExcelService, ExcelLead, ExcelFilters } from '@/services/excelService';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  padding: ${theme.spacing.xl};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  color: ${theme.colors.white};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: ${theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const FilterContainer = styled(motion.div)`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.lg};
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${theme.colors.black};
  margin-bottom: ${theme.spacing.xs};
`;

const Input = styled.input`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
`;

const Button = styled(motion.button)`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const StatCard = styled(motion.div)`
  background: ${theme.colors.white};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  flex: 1;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.primary};
`;

const StatLabel = styled.div`
  color: ${theme.colors.gray[600]};
  font-size: 0.9rem;
`;

const TableContainer = styled(motion.div)`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: ${theme.colors.gray[100]};
  padding: ${theme.spacing.md};
  text-align: left;
  font-weight: 600;
  color: ${theme.colors.black};
  border-bottom: 1px solid ${theme.colors.gray[300]};
`;

const Td = styled.td`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray[300]};
  color: ${theme.colors.black};
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.gray[600]};
`;

// Créer une instance unique du service
const excelService = new ExcelService();

interface ExcelDataPageProps {
  // Add any props if needed
}

const ExcelDataPage: React.FC<ExcelDataPageProps> = () => {
  const [leads, setLeads] = useState<ExcelLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<ExcelLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExcelFilters>({});
  const [uniqueCities, setUniqueCities] = useState<string[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueDepartments, setUniqueDepartments] = useState<string[]>([]);
  const [uniqueRegions, setUniqueRegions] = useState<string[]>([]);

  useEffect(() => {
    loadExcelData();
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      const filtered = excelService.filterData(filters);
      setFilteredLeads(filtered);
    }
  }, [filters, leads]);

  const loadExcelData = async () => {
    try {
      setLoading(true);
      const filePath = '/Users/Apple/Desktop/lead_generator/France - Special Quality package.xlsx';
      console.log('📂 Chargement du fichier:', filePath);
      
      const data = await excelService.loadFromFile(filePath);
      console.log('✅ Données chargées:', data.length, 'prospects');
      
      setLeads(data);
      setFilteredLeads(data);
      
      // Charger les valeurs uniques pour les filtres
      setUniqueCategories(excelService.getUniqueValues('category'));
      setUniqueCities(excelService.getUniqueValues('city'));
      setUniqueDepartments(excelService.getUniqueValues('department'));
      setUniqueRegions(excelService.getUniqueValues('region'));
      
      console.log('📍 Régions:', excelService.getUniqueValues('region'));
      console.log('🏢 Catégories:', excelService.getUniqueValues('category'));
      console.log('🏘️ Villes:', excelService.getUniqueValues('city').slice(0, 5));
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ExcelFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportCSV = () => {
    const csv = excelService.exportToCSV(filteredLeads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads-excel.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: leads.length,
    filtered: filteredLeads.length,
    withPhone: filteredLeads.filter(l => l.phone).length,
    withEmail: filteredLeads.filter(l => l.email).length,
  };

  if (loading) {
    return (
      <PageContainer>
        <ContentContainer>
          <Header>
            <Title>Chargement des données...</Title>
          </Header>
        </ContentContainer>
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
          <Title>Données Excel France</Title>
          <Subtitle>Gestion et filtrage des prospects depuis le fichier Excel</Subtitle>
        </Header>

        <StatsContainer>
          <StatCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total prospects</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <StatValue>{stats.filtered}</StatValue>
            <StatLabel>Filtrés</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <StatValue>{stats.withPhone}</StatValue>
            <StatLabel>Avec téléphone</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <StatValue>{stats.withEmail}</StatValue>
            <StatLabel>Avec email</StatLabel>
          </StatCard>
        </StatsContainer>

        <FilterContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Filtres</h3>
          <FilterGrid>
            <FilterGroup>
              <Label>Recherche</Label>
              <Input
                type="text"
                placeholder="Nom, adresse, catégorie..."
                value={filters.searchTerm || ''}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Catégorie</Label>
              <Select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              >
                <option value="">Toutes catégories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Ville</Label>
              <Input
                type="text"
                placeholder="Ville"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Département</Label>
              <Select
                value={filters.department || ''}
                onChange={(e) => handleFilterChange('department', e.target.value || undefined)}
              >
                <option value="">Tous départements</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Région</Label>
              <Select
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value || undefined)}
              >
                <option value="">Toutes régions</option>
                {uniqueRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Note minimale</Label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={filters.minRating || ''}
                onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </FilterGroup>
          </FilterGrid>

          <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.md }}>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={filters.hasPhone || false}
                onChange={(e) => handleFilterChange('hasPhone', e.target.checked || undefined)}
              />
              <Label>Avec téléphone</Label>
            </CheckboxContainer>

            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={filters.hasEmail || false}
                onChange={(e) => handleFilterChange('hasEmail', e.target.checked || undefined)}
              />
              <Label>Avec email</Label>
            </CheckboxContainer>

            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={filters.hasWebsite || false}
                onChange={(e) => handleFilterChange('hasWebsite', e.target.checked || undefined)}
              />
              <Label>Avec site web</Label>
            </CheckboxContainer>
          </div>

          <div style={{ marginTop: theme.spacing.md }}>
            <Button
              onClick={handleExportCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Exporter CSV ({filteredLeads.length} prospects)
            </Button>
          </div>
        </FilterContainer>

        <TableContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {filteredLeads.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Nom</Th>
                  <Th>Adresse</Th>
                  <Th>Téléphone</Th>
                  <Th>Email</Th>
                  <Th>Catégorie</Th>
                  <Th>Ville</Th>
                  <Th>Gérant</Th>
                  <Th>Note</Th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <Td>{lead.name}</Td>
                    <Td>{lead.address}</Td>
                    <Td>{lead.phone || '-'}</Td>
                    <Td>{lead.email || '-'}</Td>
                    <Td>{lead.category || '-'}</Td>
                    <Td>{lead.city || '-'}</Td>
                    <Td>{lead.manager || '-'}</Td>
                    <Td>{lead.rating || '-'}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3>Aucune donnée trouvée</h3>
              <p>Aucun prospect ne correspond aux filtres sélectionnés.</p>
            </EmptyState>
          )}
        </TableContainer>
      </ContentContainer>
    </PageContainer>
  );
}

export default ExcelDataPage;
