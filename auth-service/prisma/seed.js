// prisma/seed.ts (or seed.js, adjust imports as needed)

// Assuming you're using CommonJS like the rest of your project:
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
    console.log(`Start seeding ...`);

    // 1. Create Universities
    const uni_mit = await prisma.university.upsert({
        where: { name: 'MIT' },
        update: {},
        create: {
            name: 'Massachusetts Institute of Technology',
            location: 'Cambridge, MA',
            website: 'https://www.mit.edu',
        },
    });

    const uni_stanford = await prisma.university.upsert({
        where: { name: 'Stanford' },
        update: {},
        create: {
            name: 'Stanford University',
            location: 'Stanford, CA',
            website: 'https://www.stanford.edu',
        },
    });

    console.log(`Created universities: ${uni_mit.name}, ${uni_stanford.name}`);

    // 2. Create Courses associated with Universities
    const course_ai = await prisma.course.upsert({
        where: { name: 'Artificial Intelligence' },
        update: {},
        create: {
            name: 'Artificial Intelligence',
            universityId: uni_mit.id, // Link to MIT
        },
    });

    const course_cyber = await prisma.course.upsert({
        where: { name: 'Cyber Security' },
        update: {},
        create: {
            name: 'Cyber Security',
            universityId: uni_mit.id, // Link to MIT
        },
    });

    const course_softeng = await prisma.course.upsert({
        where: { name: 'Software Engineering' },
        update: {},
        create: {
            name: 'Software Engineering',
            universityId: uni_stanford.id, // Link to Stanford
        },
    });

    console.log(`Created courses: ${course_ai.name}, ${course_softeng.name}`);
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