import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a sample user first - using the actual user ID from the app
  const user = await prisma.user.upsert({
    where: { email: 'dananjayahbi@gmail.com' },
    update: {},
    create: {
      id: 'cmevcpadz0000smas5fta2pwk',
      email: 'dananjayahbi@gmail.com',
      name: 'dananjaya',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1VQp3Ap6Vu', // bcrypt hash for 'password'
      preferredCurrency: 'LKR',
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
      amount: 150000, // ~$470 USD equivalent
      currency: 'LKR',
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
      targetAmount: 3200000, // ~$10,000 USD equivalent
      currentAmount: 800000, // ~$2,500 USD equivalent
      currency: 'LKR',
      userId: user.id,
    },
  })

  // Create sample accounts
  const checkingAccount = await prisma.account.upsert({
    where: { id: 'account-1' },
    update: {},
    create: {
      id: 'account-1',
      name: 'Main Checking',
      type: 'BANK',
      balance: 5420.50,
      currency: 'LKR',
      description: 'Primary checking account',
      isActive: true,
      userId: user.id,
    },
  })

  const savingsAccount = await prisma.account.upsert({
    where: { id: 'account-2' },
    update: {},
    create: {
      id: 'account-2',
      name: 'Savings Account',
      type: 'SAVINGS',
      balance: 12500.00,
      currency: 'LKR',
      description: 'Emergency fund savings',
      isActive: true,
      userId: user.id,
    },
  })

  const cashAccount = await prisma.account.upsert({
    where: { id: 'account-3' },
    update: {},
    create: {
      id: 'account-3',
      name: 'Cash Wallet',
      type: 'CASH',
      balance: 280.00,
      currency: 'LKR',
      description: 'Physical cash on hand',
      isActive: true,
      userId: user.id,
    },
  })

  const creditAccount = await prisma.account.upsert({
    where: { id: 'account-4' },
    update: {},
    create: {
      id: 'account-4',
      name: 'Credit Card',
      type: 'CREDIT_CARD',
      balance: -1250.75,
      currency: 'LKR',
      description: 'Visa rewards card',
      isActive: true,
      userId: user.id,
    },
  })

  // Create sample bills
  const electricBill = await prisma.bill.upsert({
    where: { id: 'bill-1' },
    update: {},
    create: {
      id: 'bill-1',
      name: 'Electric Bill',
      amount: 28500, // ~$89 USD equivalent
      currency: 'LKR',
      dueDate: new Date(2025, 8, 15), // September 15, 2025
      frequency: 'MONTHLY',
      categoryId: null,
      userId: user.id,
      isPaid: false,
      isRecurring: true,
      description: 'Monthly electricity bill',
    },
  })

  const rentBill = await prisma.bill.upsert({
    where: { id: 'bill-2' },
    update: {},
    create: {
      id: 'bill-2',
      name: 'Rent Payment',
      amount: 384000, // ~$1200 USD equivalent
      currency: 'LKR',
      dueDate: new Date(2025, 8, 1), // September 1, 2025
      frequency: 'MONTHLY',
      categoryId: null,
      userId: user.id,
      isPaid: true,
      isRecurring: true,
      description: 'Monthly apartment rent',
    },
  })

  // Create more goals
  const vacationGoal = await prisma.goal.upsert({
    where: { id: 'goal-2' },
    update: {},
    create: {
      id: 'goal-2',
      name: 'Vacation to Europe',
      targetAmount: 5000,
      currentAmount: 2100,
      currency: 'LKR',
      deadline: new Date(2026, 5, 15), // June 15, 2026
      userId: user.id,
    },
  })

  const carGoal = await prisma.goal.upsert({
    where: { id: 'goal-3' },
    update: {},
    create: {
      id: 'goal-3',
      name: 'New Car Down Payment U',
      targetAmount: 15000,
      currentAmount: 13000,
      currency: 'LKR',
      deadline: new Date(2025, 9, 30), // October 30, 2025
      userId: user.id,
    },
  })

  // Create sample scheduled transactions
  const salaryScheduled = await prisma.scheduledTransaction.upsert({
    where: { id: 'scheduled-1' },
    update: {},
    create: {
      id: 'scheduled-1',
      amount: 150000,
      currency: 'LKR',
      description: 'Monthly Salary',
      type: 'INCOME',
      toAccountId: checkingAccount.id,
      scheduledDate: new Date(2025, 9, 1), // October 1, 2025
      frequency: 'monthly',
      isExecuted: false,
      userId: user.id,
    },
  })

  const rentScheduled = await prisma.scheduledTransaction.upsert({
    where: { id: 'scheduled-2' },
    update: {},
    create: {
      id: 'scheduled-2',
      amount: 384000,
      currency: 'LKR',
      description: 'Monthly Rent Payment',
      type: 'EXPENSE',
      fromAccountId: checkingAccount.id,
      scheduledDate: new Date(2025, 9, 1), // October 1, 2025
      frequency: 'monthly',
      isExecuted: false,
      userId: user.id,
    },
  })

  const savingsTransfer = await prisma.scheduledTransaction.upsert({
    where: { id: 'scheduled-3' },
    update: {},
    create: {
      id: 'scheduled-3',
      amount: 50000,
      currency: 'LKR',
      description: 'Weekly Savings Transfer',
      type: 'TRANSFER',
      fromAccountId: checkingAccount.id,
      toAccountId: savingsAccount.id,
      scheduledDate: new Date(2025, 8, 7), // September 7, 2025
      frequency: 'weekly',
      isExecuted: false,
      userId: user.id,
    },
  })

  // Create sample notifications
  const billNotification = await prisma.notification.upsert({
    where: { id: 'notification-1' },
    update: {},
    create: {
      id: 'notification-1',
      title: 'Electric Bill Due Soon',
      message: 'Your electric bill of $89.20 is due in 3 days. Don\'t forget to pay it on time.',
      type: 'BILL_DUE',
      isRead: false,
      actionUrl: '/bills',
      userId: user.id,
    },
  })

  const goalNotification = await prisma.notification.upsert({
    where: { id: 'notification-2' },
    update: {},
    create: {
      id: 'notification-2',
      title: 'Goal Progress Update',
      message: 'You\'re 80% complete with your New Car Down Payment goal! Only $3,000 remaining.',
      type: 'GOAL_DEADLINE',
      isRead: false,
      actionUrl: '/goals',
      userId: user.id,
    },
  })

  const lowBalanceNotification = await prisma.notification.upsert({
    where: { id: 'notification-3' },
    update: {},
    create: {
      id: 'notification-3',
      title: 'Low Balance Alert',
      message: 'Your Cash Wallet balance is low ($280.00). Consider adding funds.',
      type: 'LOW_BALANCE',
      isRead: true,
      actionUrl: '/accounts',
      userId: user.id,
    },
  })

  // Create sample activities
  const transactionActivity = await prisma.activity.upsert({
    where: { id: 'activity-1' },
    update: {},
    create: {
      id: 'activity-1',
      type: 'TRANSACTION_CREATED',
      description: 'Created transaction: Grocery Shopping at Whole Foods',
      metadata: JSON.stringify({
        amount: -89.45,
        account: 'Main Checking',
        category: 'Food & Dining',
        transactionType: 'EXPENSE',
        merchant: 'Whole Foods Market'
      }),
      userId: user.id,
    },
  })

  const billPaidActivity = await prisma.activity.upsert({
    where: { id: 'activity-2' },
    update: {},
    create: {
      id: 'activity-2',
      type: 'BILL_PAID',
      description: 'Paid Electric Bill - Monthly electric utility payment',
      metadata: JSON.stringify({
        amount: -89.20,
        account: 'Main Checking',
        category: 'Utilities',
        billName: 'Electric Bill'
      }),
      userId: user.id,
    },
  })

  const goalActivity = await prisma.activity.upsert({
    where: { id: 'activity-3' },
    update: {},
    create: {
      id: 'activity-3',
      type: 'GOAL_UPDATED',
      description: 'Updated Emergency Fund goal - Added $500 progress',
      metadata: JSON.stringify({
        amount: 500.00,
        goalName: 'Emergency Fund',
        progress: '80%'
      }),
      userId: user.id,
    },
  })

  const accountActivity = await prisma.activity.upsert({
    where: { id: 'activity-4' },
    update: {},
    create: {
      id: 'activity-4',
      type: 'ACCOUNT_CREATED',
      description: 'Created new account: Investment Portfolio',
      metadata: JSON.stringify({
        accountName: 'Investment Portfolio',
        accountType: 'INVESTMENT',
        initialBalance: 2500.00
      }),
      userId: user.id,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log({ 
    user, 
    incomeCategory, 
    expenseCategory, 
    transaction, 
    goal, 
    vacationGoal, 
    carGoal,
    checkingAccount, 
    savingsAccount, 
    cashAccount, 
    creditAccount,
    electricBill,
    rentBill,
    salaryScheduled,
    rentScheduled,
    savingsTransfer,
    billNotification,
    goalNotification,
    lowBalanceNotification,
    transactionActivity,
    billPaidActivity,
    goalActivity,
    accountActivity
  })
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
