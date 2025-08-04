import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Phone, Mail, Globe, MapPin, Building } from 'lucide-react';

// -------------------- Types --------------------
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

// -------------------- Styled Components --------------------
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', sans-serif;
`;

const Header = styled(motion.header)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  min-width: 75px;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled(motion.aside)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 120px;
`;

const FilterGroup = styled.div`
  margin-bottom: 1.2rem;
`;

const FilterLabel = styled.label`
  color: white;
  font-size: 0.85rem;
  display: block;
  margin-bottom: 0.4rem;
`;

const TextInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  font-size: 0.85rem;
`;

const Select = styled.select`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  font-size: 0.85rem;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SearchBar = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
`;

const ContactButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ContactButton = styled.a`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.4rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const PageButton = styled.button<{active?: boolean}>`
  background: ${({active})=>active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  font-size: 0.8rem;
`;

// -------------------- Helper --------------------
const regionsByDept: Record<string,string> = {
  '01':'Auvergne-Rhône-Alpes','02':'Hauts-de-France','03':'Auvergne-Rhône-Alpes','04':'Provence-Alpes-Côte d\'Azur','05':'Provence-Alpes-Côte d\'Azur','06':'Provence-Alpes-Côte d\'Azur','07':'Auvergne-Rhône-Alpes','08':'Grand Est','09':'Occitanie','10':'Grand Est','11':'Occitanie','12':'Occitanie','13':'Provence-Alpes-Côte d\'Azur','14':'Normandie','15':'Auvergne-Rhône-Alpes','16':'Nouvelle-Aquitaine','17':'Nouvelle-Aquitaine','18':'Centre-Val de Loire','19':'Nouvelle-Aquitaine','21':'Bourgogne-Franche-Comté','22':'Bretagne','23':'Nouvelle-Aquitaine','24':'Nouvelle-Aquitaine','25':'Bourgogne-Franche-Comté','26':'Auvergne-Rhône-Alpes','27':'Normandie','28':'Centre-Val de Loire','29':'Bretagne','2A':'Corse','2B':'Corse','30':'Occitanie','31':'Occitanie','32':'Occitanie','33':'Nouvelle-Aquitaine','34':'Occitanie','35':'Bretagne','36':'Centre-Val de Loire','37':'Centre-Val de Loire','38':'Auvergne-Rhône-Alpes','39':'Bourgogne-Franche-Comté','40':'Nouvelle-Aquitaine','41':'Centre-Val de Loire','42':'Auvergne-Rhône-Alpes','43':'Auvergne-Rhône-Alpes','44':'Pays de la Loire','45':'Centre-Val de Loire','46':'Occitanie','47':'Nouvelle-Aquitaine','48':'Occitanie','49':'Pays de la Loire','50':'Normandie','51':'Grand Est','52':'Grand Est','53':'Pays de la Loire','54':'Grand Est','55':'Grand Est','56':'Bretagne','57':'Grand Est','58':'Bourgogne-Franche-Comté','59':'Hauts-de-France','60':'Hauts-de-France','61':'Normandie','62':'Hauts-de-France','63':'Auvergne-Rhône-Alpes','64':'Nouvelle-Aquitaine','65':'Occitanie','66':'Occitanie','67':'Grand Est','68':'Grand Est','69':'Auvergne-Rhône-Alpes','70':'Bourgogne-Franche-Comté','71':'Bourgogne-Franche-Comté','72':'Pays de la Loire','73':'Auvergne-Rhône-Alpes','74':'Auvergne-Rhône-Alpes','75':'Île-de-France','76':'Normandie','77':'Île-de-France','78':'Île-de-France','79':'Nouvelle-Aquitaine','80':'Hauts-de-France','81':'Occitanie','82':'Occitanie','83':'Provence-Alpes-Côte d\'Azur','84':'Provence-Alpes-Côte d\'Azur','85':'Pays de la Loire','86':'Nouvelle-Aquitaine','87':'Nouvelle-Aquitaine','88':'Grand Est','89':'Bourgogne-Franche-Comté','90':'Bourgogne-Franche-Comté','91':'Île-de-France','92':'Île-de-France','93':'Île-de-France','94':'Île-de-France','95':'Île-de-France'
};

function getRegion(dept:string){return regionsByDept[dept]||'France';}

// -------------------- Component --------------------
export default function ExcelExplorer(){
  const [data,setData] = useState<ExcelRow[]>([]);
  const [filtered,setFiltered] = useState<ExcelRow[]>([]);
  const [filters,setFilters] = useState({
    search:'',category:'',city:'',department:'',region:'',hasPhone:false,hasEmail:false,hasWebsite:false
  });
  const [currentPage,setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);

  // ---------- Load Data ----------
  useEffect(()=>{loadData();},[]);
  async function loadData(){
    try{
      setLoading(true);
      // Essaye d'abord la version complète, puis fallback vers la light
      const resFull = await fetch('/prospects-data.json');
      const ok = resFull.ok ? resFull : await fetch('/prospects-data-light.json');
      if(!ok.ok) throw new Error('Fichier JSON manquant');
      const json = await ok.json();
      const processed:ExcelRow[] = json.map((r:any,i:number)=>{
        const postal = String(r['[Zip]']||r.zip||r.postalCode||'');
        const dept = postal.substring(0,2);
        return{
          id:`row-${i}`,
          companyName:r['[Company Name]']||r['Company Name']||r.companyName||r.name||'Anonyme',
          address:r['[Street]']||r['Street']||r.address||'',
          city:r['[City]']||r['City']||r.city||'',
          postalCode: postal || r['Zip'] || r['[Zip]'] || '',
          phone:(r['[Tel]']||r.phone||'').trim()||undefined,
          email:(r['[Email]']||r.email||'').trim()||undefined,
          website:(r['[Website]']||r.website||'').trim()||undefined,
          category:(r['[CATEGORY]']||r.category||'').trim()||undefined,
          department:dept,
          region:getRegion(dept)
        };
      }).filter((row: ExcelRow) => Boolean(row.companyName));
      setData(processed);
    }catch(e){console.error(e);setError('Erreur de chargement');}
    finally{setLoading(false);} }

  // ---------- Filters ----------
  useEffect(()=>{applyFilters();},[data,filters]);
  function applyFilters(){
    let f = [...data];
    const s = filters.search.toLowerCase();
    if(s) f = f.filter(r=>(
      r.companyName.toLowerCase().includes(s)||
      r.city.toLowerCase().includes(s)||
      r.address.toLowerCase().includes(s)
    ));
    if(filters.category) f = f.filter(r=>r.category===filters.category);
    if(filters.city) f = f.filter(r=>r.city===filters.city);
    if(filters.department) f = f.filter(r=>r.department===filters.department);
    if(filters.region) f = f.filter(r=>r.region===filters.region);
    if(filters.hasPhone) f = f.filter(r=>r.phone);
    if(filters.hasEmail) f = f.filter(r=>r.email);
    if(filters.hasWebsite) f = f.filter(r=>r.website);
    setFiltered(f);
    setCurrentPage(1);
  }

  // ---------- Export ----------
  function exportCSV(){
    const rows = [
      ['Nom','Adresse','Ville','CP','Téléphone','Email','Site','Catégorie','Département','Région'],
      ...filtered.map(r=>[
        r.companyName,r.address,r.city,r.postalCode,r.phone||'',r.email||'',r.website||'',r.category||'',r.department,r.region
      ])
    ];
    const csv = rows.map(row=>row.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download='prospects-france.csv'; a.click();
  }

  // ---------- Derived ----------
  const uniques = {
    categories: Array.from(new Set(data.map(r => r.category).filter((v): v is string => Boolean(v)))),
    cities: Array.from(new Set(data.map(r => r.city).filter(Boolean))),
    departments: Array.from(new Set(data.map(r => r.department).filter(Boolean))),
    regions: Array.from(new Set(data.map(r => r.region).filter(Boolean)))
  } as const;
  const start = (currentPage-1)*itemsPerPage;
  const pageData = filtered.slice(start,start+itemsPerPage);
  const totalPages = Math.ceil(filtered.length/itemsPerPage)||1;

  // -------------------- Render --------------------
  if(loading) return <PageContainer style={{display:'flex',justifyContent:'center',alignItems:'center',color:'#fff'}}>Chargement...</PageContainer>;
  if(error) return <PageContainer style={{display:'flex',justifyContent:'center',alignItems:'center',color:'#fff'}}>{error}</PageContainer>;

  return(
    <PageContainer>
      {/* ---------- Header ---------- */}
      <Header initial={{y:-40,opacity:0}} animate={{y:0,opacity:1}}>
        <HeaderContent>
          <div>
            <Title>Excel Explorer</Title>
            <p style={{margin:0,opacity:0.8}}>Analysez vos prospects français</p>
          </div>
          <Stats>
            <StatCard whileHover={{scale:1.05}}>
              <div style={{fontWeight:700}}>{data.length}</div>
              <small>Total</small>
            </StatCard>
            <StatCard whileHover={{scale:1.05}}>
              <div style={{fontWeight:700}}>{filtered.length}</div>
              <small>Filtrés</small>
            </StatCard>
          </Stats>
        </HeaderContent>
      </Header>

      {/* ---------- Body ---------- */}
      <MainContent>
        {/* ---- Sidebar ---- */}
        <Sidebar initial={{x:-30,opacity:0}} animate={{x:0,opacity:1}}>
          <h3 style={{color:'#fff',marginBottom:'1rem'}}><Filter size={18}/> Filtres</h3>
          <FilterGroup>
            <FilterLabel>Recherche</FilterLabel>
            <TextInput placeholder="Nom, ville..." value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Catégorie</FilterLabel>
            <Select value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}>
              <option value="">Toutes</option>
              {uniques.categories.map(c=><option key={c}>{c}</option>)}
            </Select>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Ville</FilterLabel>
            <Select value={filters.city} onChange={e=>setFilters({...filters,city:e.target.value})}>
              <option value="">Toutes</option>
              {uniques.cities.map(c=><option key={c}>{c}</option>)}
            </Select>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Département</FilterLabel>
            <Select value={filters.department} onChange={e=>setFilters({...filters,department:e.target.value})}>
              <option value="">Tous</option>
              {uniques.departments.map(d=><option key={d}>{d}</option>)}
            </Select>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Région</FilterLabel>
            <Select value={filters.region} onChange={e=>setFilters({...filters,region:e.target.value})}>
              <option value="">Toutes</option>
              {uniques.regions.map(r=><option key={r}>{r}</option>)}
            </Select>
          </FilterGroup>
          <button onClick={exportCSV} style={{width:'100%',marginTop:'1rem',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'#fff',border:'none',padding:'0.6rem 0',borderRadius:'8px',display:'flex',justifyContent:'center',alignItems:'center',gap:'0.4rem',cursor:'pointer'}}>
            <Download size={16}/> Exporter CSV
          </button>
        </Sidebar>

        {/* ---- Content ---- */}
        <Content>
          <SearchBar initial={{opacity:0}} animate={{opacity:1}}>
            <Search size={20} color="#fff"/>
            <SearchInput placeholder="Recherche globale..." value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/>
          </SearchBar>

          <Results>
            {pageData.map(row=>(
              <Card key={row.id} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}}>
                <strong>{row.companyName}</strong>
                {row.category && <span style={{fontSize:'0.8rem',opacity:0.8}}>{row.category}</span>}
                <Info><MapPin size={14}/> {row.address}, {row.city} {row.postalCode}</Info>
                <Info><Building size={14}/> {row.department} - {row.region}</Info>
                {row.phone && <Info><Phone size={14}/> {row.phone}</Info>}
                {row.email && <Info><Mail size={14}/> {row.email}</Info>}
                {row.website && <Info><Globe size={14}/> {row.website}</Info>}
                <ContactButtons>
                  {row.phone && <ContactButton href={`tel:${row.phone}`}><Phone size={12}/></ContactButton>}
                  {row.email && <ContactButton href={`mailto:${row.email}`}><Mail size={12}/></ContactButton>}
                  {row.website && <ContactButton href={row.website} target="_blank"><Globe size={12}/></ContactButton>}
                </ContactButtons>
              </Card>
            ))}
          </Results>

          {totalPages>1 && (
            <Pagination>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <PageButton key={p} active={p===currentPage} onClick={()=>setCurrentPage(p)}>{p}</PageButton>
              ))}
            </Pagination>
          )}
        </Content>
      </MainContent>
    </PageContainer>
  );
}
