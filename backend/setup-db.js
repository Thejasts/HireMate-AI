require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true // Essential for running full SQL scripts
        });

        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await connection.query(schemaSql);
        console.log('Schema created successfully!');

        console.log('Reading advanced_features.sql...');
        const featuresPath = path.join(__dirname, 'db', 'advanced_features.sql');
        const featuresSql = fs.readFileSync(featuresPath, 'utf8');

        console.log('Executing advanced_features.sql...');
        // We have to split by DELIMITER because the mysql driver doesn't support DELIMITER natively
        // However, since it's a bit complex to split, let's just use the native multipleStatements 
        // Wait, multipleStatements DOES NOT support DELIMITER keyword!
        // We need to parse it or just execute the procedures directly from JS.
        // Actually, let's manually strip DELIMITER lines and split by `//`
        
        let queries = featuresSql
            .replace(/DELIMITER \/\//g, '')
            .replace(/DELIMITER ;/g, '')
            .split('//')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        await connection.query(`USE ${process.env.DB_NAME}`);
        
        for (let query of queries) {
            console.log('Executing block...');
            await connection.query(query);
        }

        console.log('Advanced features installed successfully!');
        
        await connection.end();
        console.log('Database setup complete! You can now start the server.');
        process.exit(0);
    } catch (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    }
}

setupDatabase();
