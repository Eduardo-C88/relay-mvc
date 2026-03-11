// run-migrations.js (at the root of your project)
const { db } = require('./src/db/db'); 
const { runMigrations } = require('./src/db/migrate');

async function main() {
    try {
        await runMigrations(db);
        console.log('✅ Migrations finished successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

main();