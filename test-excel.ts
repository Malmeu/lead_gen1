import { ExcelService } from './src/services/excelService';

async function testExcelLoading() {
  const service = new ExcelService();
  
  try {
    console.log('🔄 Chargement du fichier Excel...');
    const data = await service.loadFromFile('/Users/Apple/Desktop/lead_generator/France - Special Quality package.xlsx');
    
    console.log(`✅ ${data.length} prospects chargés`);
    
    if (data.length > 0) {
      console.log('\n📊 Aperçu des données:');
      console.log('Premier prospect:', data[0]);
      
      console.log('\n📍 Répartition par régions:');
      const regions = service.getUniqueValues('region');
      console.log('Régions trouvées:', regions);
      
      console.log('\n🏢 Catégories d\'activité:');
      const categories = service.getUniqueValues('category');
      console.log('Catégories trouvées:', categories);
      
      console.log('\n🏘️ Villes principales:');
      const cities = service.getUniqueValues('city');
      console.log('Villes trouvées:', cities.slice(0, 10));
      
      console.log('\n📮 Départements:');
      const departments = service.getUniqueValues('department');
      console.log('Départements trouvés:', departments);
      
      // Test des filtres
      const testFilters = {
        region: regions[0],
        category: categories[0]
      };
      
      const filtered = service.filterData(testFilters);
      console.log(`\n🔍 Test filtre - ${regions[0]} + ${categories[0]}: ${filtered.length} résultats`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : String(error));
  }
}

testExcelLoading();
