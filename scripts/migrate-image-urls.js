/**
 * Script Node.js para migrar URLs de imagens para paths
 * 
 * Uso: node scripts/migrate-image-urls.js [--dry-run] [--rollback]
 * 
 * --dry-run: Apenas mostra o que seria alterado, sem fazer alterações
 * --rollback: Reverte as alterações usando o backup (requer backup)
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK = process.argv.includes('--rollback');

// Função para extrair path de URL completa
function extractPathFromUrl(url) {
  if (!url) return null;
  
  // Se já for um path (não começa com http), retornar como está
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }
  
  // Extrair path de URL completa
  const parts = url.split('/api/v1/images/');
  return parts.length > 1 ? parts[1] : null;
}

// Função para criar backup
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(__dirname, `backups/car_images_backup_${timestamp}.json`);
  
  console.log('📦 Criando backup...');
  
  const images = await prisma.carImage.findMany();
  
  // Criar diretório de backup se não existir
  const backupDir = path.dirname(backupFile);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.writeFileSync(backupFile, JSON.stringify(images, null, 2));
  console.log(`✅ Backup criado: ${backupFile}`);
  
  return backupFile;
}

// Função para fazer migração
async function migrate() {
  console.log('🔍 Verificando imagens no banco...');
  
  const allImages = await prisma.carImage.findMany();
  
  const stats = {
    total: allImages.length,
    urlsCompletas: 0,
    jaSaoPaths: 0,
    paraAtualizar: []
  };
  
  allImages.forEach(image => {
    if (image.imageUrl.startsWith('http://') || image.imageUrl.startsWith('https://')) {
      stats.urlsCompletas++;
      const newPath = extractPathFromUrl(image.imageUrl);
      if (newPath) {
        stats.paraAtualizar.push({
          id: image.id,
          oldUrl: image.imageUrl,
          newPath: newPath
        });
      }
    } else {
      stats.jaSaoPaths++;
    }
  });
  
  console.log('\n📊 Estatísticas:');
  console.log(`   Total de imagens: ${stats.total}`);
  console.log(`   URLs completas: ${stats.urlsCompletas}`);
  console.log(`   Já são paths: ${stats.jaSaoPaths}`);
  console.log(`   Serão atualizadas: ${stats.paraAtualizar.length}`);
  
  if (stats.paraAtualizar.length === 0) {
    console.log('\n✅ Nenhuma imagem precisa ser atualizada!');
    return;
  }
  
  console.log('\n📝 Exemplos de alterações:');
  stats.paraAtualizar.slice(0, 5).forEach((item, index) => {
    console.log(`\n   ${index + 1}. ID: ${item.id}`);
    console.log(`      ANTES: ${item.oldUrl}`);
    console.log(`      DEPOIS: ${item.newPath}`);
  });
  
  if (DRY_RUN) {
    console.log('\n🔍 Modo DRY-RUN: Nenhuma alteração foi feita.');
    return;
  }
  
  // Criar backup antes de migrar
  const backupFile = await createBackup();
  
  console.log('\n🔄 Iniciando migração...');
  
  let updated = 0;
  let errors = 0;
  
  for (const item of stats.paraAtualizar) {
    try {
      await prisma.carImage.update({
        where: { id: item.id },
        data: { imageUrl: item.newPath }
      });
      updated++;
    } catch (error) {
      console.error(`❌ Erro ao atualizar imagem ${item.id}:`, error.message);
      errors++;
    }
  }
  
  console.log('\n✅ Migração concluída!');
  console.log(`   Atualizadas: ${updated}`);
  console.log(`   Erros: ${errors}`);
  console.log(`   Backup salvo em: ${backupFile}`);
  
  // Verificar resultado
  const afterStats = await prisma.carImage.findMany();
  const urlsRestantes = afterStats.filter(img => 
    img.imageUrl.startsWith('http://') || img.imageUrl.startsWith('https://')
  ).length;
  
  console.log(`\n📊 Após migração:`);
  console.log(`   URLs completas restantes: ${urlsRestantes}`);
  
  if (urlsRestantes > 0) {
    console.log('\n⚠️  Ainda há URLs completas no banco. Verifique manualmente.');
  }
}

// Função para fazer rollback
async function rollback() {
  console.log('🔄 Iniciando rollback...');
  
  // Listar backups disponíveis
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    console.error('❌ Diretório de backups não encontrado!');
    return;
  }
  
  const backups = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('car_images_backup_') && file.endsWith('.json'))
    .sort()
    .reverse(); // Mais recente primeiro
  
  if (backups.length === 0) {
    console.error('❌ Nenhum backup encontrado!');
    return;
  }
  
  console.log('\n📦 Backups disponíveis:');
  backups.forEach((backup, index) => {
    console.log(`   ${index + 1}. ${backup}`);
  });
  
  // Usar o backup mais recente
  const latestBackup = backups[0];
  const backupFile = path.join(backupDir, latestBackup);
  
  console.log(`\n📥 Restaurando do backup: ${latestBackup}`);
  
  const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  if (DRY_RUN) {
    console.log(`\n🔍 Modo DRY-RUN: Seriam restaurados ${backupData.length} registros.`);
    return;
  }
  
  let restored = 0;
  let errors = 0;
  
  for (const image of backupData) {
    try {
      await prisma.carImage.update({
        where: { id: image.id },
        data: { imageUrl: image.imageUrl }
      });
      restored++;
    } catch (error) {
      console.error(`❌ Erro ao restaurar imagem ${image.id}:`, error.message);
      errors++;
    }
  }
  
  console.log('\n✅ Rollback concluído!');
  console.log(`   Restaurados: ${restored}`);
  console.log(`   Erros: ${errors}`);
}

// Executar
async function main() {
  try {
    if (ROLLBACK) {
      await rollback();
    } else {
      await migrate();
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

