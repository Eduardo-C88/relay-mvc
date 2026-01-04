const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Criar estatísticas diárias de exemplo
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyStats.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      totalResources: 0,
      newResources: 0,
      totalBorrowings: 0,
      newBorrowings: 0,
      completedBorrowings: 0,
      totalReviews: 0,
      newReviews: 0,
      avgRating: null
    }
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
