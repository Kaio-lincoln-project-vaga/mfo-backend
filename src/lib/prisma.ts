import { PrismaClient } from '@prisma/client';


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});


export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}


export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
}

// Previne múltiplas instâncias em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}