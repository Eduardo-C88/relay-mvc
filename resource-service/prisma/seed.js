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

    // Create resources
    const resources = [
        {
            ownerId: 1,
            title: 'Intro to Algorithms',
            categoryId: 1,
            description: 'A clean copy of CLRS 3rd edition.',
            statusId: 1, // AVAILABLE
            price: 60.0,
            imageUrl: 'https://example.com/images/book1.jpg',
        },
        {
            ownerId: 2,
            title: 'Texas Instruments TI-84 Calculator',
            categoryId: 2,
            description: 'Works perfectly, minor scratches.',
            statusId: 1, // AVAILABLE
            price: 50.0,
            imageUrl: 'https://example.com/images/calculator.jpg',
        },
        {
            ownerId: 3,
            title: 'IKEA Study Desk',
            categoryId: 3,
            description: 'Light wood desk, great for dorm rooms.',
            statusId: 1, // AVAILABLE
            price: 80.0,
            imageUrl: 'https://example.com/images/desk.jpg',
        },
    ];
    for (const r of resources) {
        await prisma.resource.upsert({
            where: { title: r.title },
            update: {},
            create: r,
        });
    }

    // Create requests
    const requests = [
        {
            requesterId: 2,
            title: 'Looking for a physics textbook',
            description: 'Need it for next semester’s mechanics course.',
            categoryId: 1, // Books
            statusId: 4,   // PENDING
        },
        {
            requesterId: 3,
            title: 'Need an ergonomic chair',
            description: 'For better posture during study sessions.',
            categoryId: 3, // Furniture
            statusId: 1,   // AVAILABLE
        },
    ];
    for (const req of requests) {
        await prisma.request.upsert({
            where: { title: req.title },
            update: {},
            create: req,
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