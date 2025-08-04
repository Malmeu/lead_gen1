import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '@/styles/theme';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  padding: ${theme.spacing.md} 0;
  box-shadow: ${theme.shadows.sm};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
`;

const Logo = styled(motion.h1)`
  font-size: ${theme.fontSizes.xl};
  font-weight: 700;
  color: ${theme.colors.primary};
  margin: 0;
`;

const Main = styled.main`
  flex: 1;
  padding: ${theme.spacing.xl} 0;
`;

const Footer = styled.footer`
  background: ${theme.colors.gray[900]};
  color: ${theme.colors.white};
  padding: ${theme.spacing.lg} 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  text-align: center;
`;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <Logo
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Lead Generator France
          </Logo>
        </HeaderContent>
      </Header>

      <Main>
        {children}
      </Main>

      <Footer>
        <FooterContent>
          <p>&copy; 2024 Lead Generator France. Tous droits réservés.</p>
        </FooterContent>
      </Footer>
    </LayoutContainer>
  );
};
