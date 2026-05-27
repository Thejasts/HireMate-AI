require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrateGD() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        const schemaPath = path.join(__dirname, 'db', 'gd_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing gd_schema.sql...');
        await connection.query(schemaSql);
        
        console.log('GD schema created successfully!');
        
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Error setting up GD schema:', err);
        process.exit(1);
    }
}

migrateGD();
