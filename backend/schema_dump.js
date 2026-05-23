const db = require('./db');

async function checkSchema() {
    try {
        const [tables] = await db.query("SHOW TABLES");
        console.log("Tables:");
        console.log(tables);
        
        for (let tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            const [desc] = await db.query(`DESCRIBE ${tableName}`);
            console.log(`\nSchema for ${tableName}:`);
            console.table(desc);
        }
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
checkSchema();
