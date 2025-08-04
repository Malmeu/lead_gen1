import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '@/styles/theme';
import { SearchFilters } from '@/types';

const FormContainer = styled(motion.div)`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const FormTitle = styled.h2`
  color: ${theme.colors.gray[800]};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.gray[700]};
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.md};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.md};
  background: ${theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
`;

const Button = styled(motion.button)`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  display: block;

  &:hover {
    background: ${theme.colors.secondary};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${theme.colors.gray[400]};
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.span`
  color: ${theme.colors.error};
  font-size: ${theme.fontSizes.sm};
  margin-top: ${theme.spacing.xs};
`;

interface SearchFormProps {
  onSubmit: (data: SearchFilters) => void;
  isLoading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SearchFilters>();

  const categories = [
    'Restaurant',
    'Bar',
    'Café',
    'Boulangerie',
    'Hôtel',
    'Supermarché',
    'Boutique',
    'Salon de coiffure',
    'Garage',
    'Pharmacie',
    'Coiffeur',
    'Esthéticienne',
    'Auto-école',
    'Plombier',
    'Électricien',
    'Artisan',
    'Commerçant',
    'Autre'
  ];

  return (
    <FormContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <FormTitle>Rechercher des prospects</FormTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGrid>
          <FormGroup>
            <Label htmlFor="category">Catégorie</Label>
            <Select
              id="category"
              {...register('category', { required: 'La catégorie est requise' })}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
            {errors.category && <ErrorMessage>{errors.category.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              type="text"
              placeholder="Ex: Paris, Lyon, Marseille..."
              {...register('location', { required: 'La localisation est requise' })}
            />
            {errors.location && <ErrorMessage>{errors.location.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="radius">Rayon (km)</Label>
            <Input
              id="radius"
              type="number"
              min="1"
              max="50"
              defaultValue="10"
              {...register('radius', { 
                required: 'Le rayon est requis',
                min: { value: 1, message: 'Minimum 1 km' },
                max: { value: 50, message: 'Maximum 50 km' }
              })}
            />
            {errors.radius && <ErrorMessage>{errors.radius.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="minRating">Note minimale</Label>
            <Select
              id="minRating"
              {...register('minRating')}
            >
              <option value="">Toutes les notes</option>
              <option value="3">3+ étoiles</option>
              <option value="4">4+ étoiles</option>
              <option value="4.5">4.5+ étoiles</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="maxResults">Nombre maximum de résultats</Label>
            <Input
              id="maxResults"
              type="number"
              min="10"
              max="500"
              defaultValue="50"
              {...register('maxResults')}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="keywords">Mots-clés (optionnel)</Label>
            <Input
              id="keywords"
              type="text"
              placeholder="Ex: italien, bio, terrasse..."
              {...register('keywords')}
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <input
                type="checkbox"
                {...register('includeManager')}
                style={{ marginRight: '8px' }}
              />
              Inclure le nom du gérant
            </Label>
          </FormGroup>
        </FormGrid>

        <Button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? 'Recherche en cours...' : 'Lancer la recherche'}
        </Button>
      </form>
    </FormContainer>
  );
};
