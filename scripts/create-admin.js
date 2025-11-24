require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Uso: node scripts/create-admin.js <email> <nome> [fixed_token]');
    console.log('Exemplo: node scripts/create-admin.js admin@exemplo.com "Admin User"');
    process.exit(1);
  }

  const email = args[0];
  const name = args[1];
  const fixedToken = args[2] || `n8n_${uuidv4().replace(/-/g, '')}`;

  try {
    // Verificar se já existe
    const existing = await prisma.profile.findUnique({
      where: { email }
    });

    if (existing) {
      console.log(`❌ Profile com email ${email} já existe!`);
      process.exit(1);
    }

    // Criar profile
    const profile = await prisma.profile.create({
      data: {
        email,
        name,
        fixedToken,
        isActive: true
      }
    });

    console.log('✅ Profile admin criado com sucesso!');
    console.log(`📧 Email: ${profile.email}`);
    console.log(`👤 Nome: ${profile.name}`);
    console.log(`🔑 Fixed Token: ${profile.fixedToken}`);
    console.log('\n💡 Use este token no header Authorization:');
    console.log(`   Authorization: Bearer ${profile.fixedToken}`);
  } catch (error) {
    console.error('❌ Erro ao criar profile:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

