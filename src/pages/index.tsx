import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components';
import { Layout } from '@/components/Layout';
import { SearchForm } from '@/components/SearchForm';
import { LeadsList } from '@/components/LeadsList';
import { ExportPanel } from '@/components/ExportPanel';
import { GlobalStyles } from '@/styles/GlobalStyles';
import { SocieteComService } from '../services/societeComService';
import { Lead, SearchFilters } from '@/types';
import Link from 'next/link';

const queryClient = new QueryClient();

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const Navigation = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 48px;
`;

const NavLink = styled(Link)`
  background: rgba(255, 255, 255, 0.2);
  color: #1a1a1a;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 48px;
  color: #666;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007AFF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  text-align: center;
`;

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapingService = new SocieteComService();

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await scrapingService.searchLeads(filters);
      setLeads(results);
    } catch (error) {
      console.error('Search error:', error);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = (leadId: string, status: Lead['status']) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId ? { ...lead, status } : lead
      )
    );
  };

  const handleAddNote = (leadId: string, note: string) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId ? { ...lead, notes: note } : lead
      )
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      <Layout>
        <HomeContainer>
          <Header>
            <Navigation>
              <NavLink href="/excel-data">
                📊 Données Excel
              </NavLink>
            </Navigation>
          </Header>
          <HeroSection>
            <HeroTitle>
              Générateur de Leads France
            </HeroTitle>
            <HeroSubtitle>
              
            </HeroSubtitle>
          </HeroSection>

          <SearchForm onSubmit={handleSearch} isLoading={isLoading} />

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}

          {isLoading && (
            <LoadingContainer>
              <Spinner />
              <p>Recherche en cours...</p>
            </LoadingContainer>
          )}

          {!isLoading && leads.length > 0 && (
            <>
              <LeadsList 
                leads={leads} 
                onUpdateStatus={handleUpdateStatus}
                onAddNote={handleAddNote}
              />
              <ExportPanel leads={leads} />
            </>
          )}
        </HomeContainer>
      </Layout>
    </QueryClientProvider>
  );
}
