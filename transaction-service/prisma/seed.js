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