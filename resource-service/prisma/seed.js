require("dotenv").config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log(`Start seeding ...`);

    // Create statuses
    const statuses = [
        { name: 'AVAILABLE' },
        { name: 'BORROWED' },
        { name: 'SOLD' },
        { name: 'PENDING' },
        { name: 'APPROVED' },
        { name: 'REJECTED' },
    ];

    for (const s of statuses) {
        await prisma.status.upsert({
            where: { name: s.name },
            update: {},
            create: s,
        });
    }

    // Create resource categories
    const categories = [
        { name: 'Books', description: 'Academic and non-academic books' },
        { name: 'Electronics', description: 'Laptops, tablets, calculators, etc.' },
        { name: 'Furniture', description: 'Desks, chairs, and other study furniture' },
        { name: 'Stationery', description: 'Pens, notebooks, and other supplies' },
    ];
    for (const c of categories) {
        await prisma.category.upsert({
            where: { name: c.name },
            update: {},
            create: c,
        });
    }
    console.log(`Seeding finished.`);
}

// Execute the main function and handle errors
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });