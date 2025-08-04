import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '@/styles/theme';
import { Lead } from '@/types';
import { SocieteComService } from '../services/societeComService';

const ExportContainer = styled(motion.div)`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  margin-top: ${theme.spacing.xl};
`;

const ExportTitle = styled.h3`
  color: ${theme.colors.gray[800]};
  margin-bottom: ${theme.spacing.md};
`;

const ExportStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const StatCard = styled.div`
  background: ${theme.colors.gray[50]};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: 700;
  color: ${theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
  margin-top: ${theme.spacing.xs};
`;

const ExportButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const ExportButton = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: ${theme.colors.white};
          
          &:hover {
            background: ${theme.colors.secondary};
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
          border: 1px solid ${theme.colors.gray[300]};
          
          &:hover {
            background: ${theme.colors.gray[200]};
          }
        `;
    }
  }}
`;

interface ExportPanelProps {
  leads: Lead[];
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ leads }) => {
  const scrapingService = new SocieteComService();

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
  };

  const exportToCSV = async () => {
    try {
      const csv = await scrapingService.exportToCSV(leads);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Erreur lors de l\'export CSV');
    }
  };

  const exportToJSON = () => {
    const json = JSON.stringify(leads, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ExportContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ExportTitle>Exporter les résultats</ExportTitle>
      
      <ExportStats>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total prospects</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.new}</StatValue>
          <StatLabel>Nouveaux</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.contacted}</StatValue>
          <StatLabel>Contactés</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.qualified}</StatValue>
          <StatLabel>Qualifiés</StatLabel>
        </StatCard>
      </ExportStats>

      <ExportButtons>
        <ExportButton
          onClick={exportToCSV}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          📊 Exporter CSV
        </ExportButton>
        <ExportButton
          variant="secondary"
          onClick={exportToJSON}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          📋 Exporter JSON
        </ExportButton>
      </ExportButtons>
    </ExportContainer>
  );
};
