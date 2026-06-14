import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with 10000 dummy customers...');
  
  // Clear existing data
  await prisma.communicationLog.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  const BATCH_SIZE = 100;
  const TOTAL_CUSTOMERS = 10000;
  
  const items = [
    'Coffee Beans', 'Espresso Machine', 'Winter Mug', 'Tea Leaves', 
    'Latte Art Kit', 'French Press', 'Pour Over Cone', 'Coffee Grinder',
    'Matcha Powder', 'Ceramic Dripper', 'Cold Brew Maker', 'Reusable Filter'
  ];

  for (let batch = 0; batch < TOTAL_CUSTOMERS / BATCH_SIZE; batch++) {
    console.log(`Processing batch ${batch + 1}/${TOTAL_CUSTOMERS / BATCH_SIZE}...`);
    
    // Create customers in batches
    const customerData = Array.from({ length: BATCH_SIZE }).map((_, i) => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: `${batch}_${i}_${faker.internet.email()}`,
      phone: faker.phone.number(),
      totalSpent: parseFloat(faker.finance.amount({ min: 10, max: 2000, dec: 2 })),
      lastPurchaseDate: faker.date.recent({ days: 365 }),
      createdAt: faker.date.past({ years: 2 })
    }));

    await prisma.customer.createMany({
      data: customerData
    });

    // Create orders for these customers
    const orderData: any[] = [];
    
    for (const customer of customerData) {
      const numOrders = faker.number.int({ min: 1, max: 5 });
      for (let i = 0; i < numOrders; i++) {
        orderData.push({
          customerId: customer.id,
          amount: parseFloat(faker.finance.amount({ min: 5, max: 500, dec: 2 })),
          item: faker.helpers.arrayElement(items),
          orderDate: faker.date.recent({ days: 365 }),
        });
      }
    }

    await prisma.order.createMany({
      data: orderData
    });
  }

  console.log('Seeding completed. 10000 dummy customers generated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
