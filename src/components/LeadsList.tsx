import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '@/styles/theme';
import { Lead } from '@/types';

const ListContainer = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

const LeadCard = styled(motion.div)`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.gray[200]};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const LeadName = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.gray[800]};
  margin: 0;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const Rating = styled.span`
  background: ${theme.colors.warning};
  color: ${theme.colors.white};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
`;

const ReviewCount = styled.span`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.sm};
`;

const LeadAddress = styled.p`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm};
`;

const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.gray[700]};
  font-size: ${theme.fontSizes.sm};
`;

const StatusBadge = styled.span<{ status: Lead['status'] }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ status }) => {
    switch (status) {
      case 'new':
        return `
          background: ${theme.colors.primary};
          color: ${theme.colors.white};
        `;
      case 'contacted':
        return `
          background: ${theme.colors.warning};
          color: ${theme.colors.white};
        `;
      case 'qualified':
        return `
          background: ${theme.colors.success};
          color: ${theme.colors.white};
        `;
      case 'lost':
        return `
          background: ${theme.colors.error};
          color: ${theme.colors.white};
        `;
      default:
        return `
          background: ${theme.colors.gray[200]};
          color: ${theme.colors.gray[700]};
        `;
    }
  }}
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const ActionButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.white};
  color: ${theme.colors.gray[700]};
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.gray[50]};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']};
  color: ${theme.colors.gray[500]};
`;

interface LeadsListProps {
  leads: Lead[];
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
  onAddNote: (leadId: string, note: string) => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({ 
  leads, 
  onUpdateStatus, 
  onAddNote 
}) => {
  if (leads.length === 0) {
    return (
      <EmptyState>
        <h3>Aucun prospect trouvé</h3>
        <p>Lancez une recherche pour commencer</p>
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      {leads.map((lead, index) => (
        <LeadCard
          key={lead.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <CardHeader>
            <LeadName>{lead.name}</LeadName>
            {lead.rating && (
              <RatingContainer>
                <Rating>★ {lead.rating}</Rating>
                {lead.reviewCount && (
                  <ReviewCount>({lead.reviewCount} avis)</ReviewCount>
                )}
              </RatingContainer>
            )}
          </CardHeader>

          <LeadAddress>{lead.address}</LeadAddress>

          <ContactInfo>
            {lead.phone && (
              <ContactItem>
                📞 {lead.phone}
              </ContactItem>
            )}
            {lead.email && (
              <ContactItem>
                ✉️ {lead.email}
              </ContactItem>
            )}
            {lead.website && (
              <ContactItem>
                🌐 <a href={lead.website} target="_blank" rel="noopener noreferrer">
                  {lead.website}
                </a>
              </ContactItem>
            )}
            {lead.manager && (
              <ContactItem>
                👤 <strong>Gérant:</strong> {lead.manager}
              </ContactItem>
            )}
          </ContactInfo>

          <div>
            <StatusBadge status={lead.status}>{lead.status}</StatusBadge>
          </div>

          <Actions>
            <ActionButton onClick={() => onUpdateStatus(lead.id, 'contacted')}>
              Marquer contacté
            </ActionButton>
            <ActionButton onClick={() => onUpdateStatus(lead.id, 'qualified')}>
              Marquer qualifié
            </ActionButton>
            <ActionButton onClick={() => onUpdateStatus(lead.id, 'lost')}>
              Marquer perdu
            </ActionButton>
          </Actions>
        </LeadCard>
      ))}
    </ListContainer>
  );
};
