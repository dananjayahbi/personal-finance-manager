import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a sample user first
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1VQp3Ap6Vu', // bcrypt hash for 'password'
      preferredCurrency: 'USD',
    },
  })

  // Create sample categories
  const incomeCategory = await prisma.category.upsert({
    where: { id: 'income-category-1' },
    update: {},
    create: {
      id: 'income-category-1',
      name: 'Salary',
      type: 'INCOME',
      icon: '💰',
      color: '#10B981',
      userId: user.id,
    },
  })

  const expenseCategory = await prisma.category.upsert({
    where: { id: 'expense-category-1' },
    update: {},
    create: {
      id: 'expense-category-1',
      name: 'Food & Dining',
      type: 'EXPENSE',
      icon: '🍔',
      color: '#EF4444',
      userId: user.id,
    },
  })

  // Create a sample transaction
  const transaction = await prisma.transaction.upsert({
    where: { id: 'transaction-1' },
    update: {},
    create: {
      id: 'transaction-1',
      amount: 5000,
      currency: 'USD',
      description: 'Monthly Salary',
      type: 'INCOME',
      userId: user.id,
      categoryId: incomeCategory.id,
    },
  })

  // Create a sample goal
  const goal = await prisma.goal.upsert({
    where: { id: 'goal-1' },
    update: {},
    create: {
      id: 'goal-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2500,
      currency: 'USD',
      userId: user.id,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log({ user, incomeCategory, expenseCategory, transaction, goal })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
