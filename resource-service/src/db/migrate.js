const fs = require('fs');
const path = require('path');
const { sql } = require('kysely');

exports.runMigrations = async (db) => {
    console.log('--- Starting Database Migrations ---');

    // 1. Create the migration tracking table if it doesn't exist
    await sql`
        CREATE TABLE IF NOT EXISTS migration_history (
            id SERIAL PRIMARY KEY,
            file_name TEXT NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT NOW()
        )
    `.execute(db);

    // 2. Read all .sql files from the migrations folder
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Ensures 001 runs before 002

    for (const file of files) {
        // 3. Check if this specific file has already been run
        const alreadyRun = await sql`
            SELECT id FROM migration_history WHERE file_name = ${file}
        `.execute(db);

        if (alreadyRun.rows.length > 0) {
            console.log(`Skipping: ${file} (Already applied)`);
            continue;
        }

        // 4. Run the migration in a transaction
        console.log(`Applying: ${file}...`);
        const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        try {
            await db.transaction().execute(async (trx) => {
                // Run the actual migration SQL
                await sql.raw(sqlContent).execute(trx);
                
                // Record that this migration succeeded
                await sql`
                    INSERT INTO migration_history (file_name) VALUES (${file})
                `.execute(trx);
            });
            console.log(`Successfully applied: ${file}`);
        } catch (err) {
            console.error(`❌ Error applying ${file}:`, err.message);
            // In a CS project, we stop the process if a migration fails to prevent data corruption
            process.exit(1); 
        }
    }
    console.log('--- Migrations Complete ---');
};