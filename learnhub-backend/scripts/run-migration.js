// Script to run database migration
const { sequelize } = require('../src/models');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Starting migration...');
    
    // Read migration files
    const migrationFiles = [
      path.join(__dirname, '../migrations/add-video-progress-and-quiz-type.sql'),
      path.join(__dirname, '../migrations/add-essayanswer-to-quizanswers.sql'),
      path.join(__dirname, '../migrations/allow-null-selectedoptionid.sql'),
      path.join(__dirname, '../migrations/add-login-streak-fields.sql'),
    ];
    
    let sql = '';
    for (const file of migrationFiles) {
      if (fs.existsSync(file)) {
        sql += fs.readFileSync(file, 'utf8') + '\n';
      }
    }
    
    // Split by semicolon and filter out comments and empty lines
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Remove comments and empty lines
        const cleaned = s.replace(/--.*$/gm, '').trim();
        return cleaned && cleaned.length > 0 && !cleaned.startsWith('--');
      })
      .map(s => s.replace(/--.*$/gm, '').trim()) // Remove inline comments
      .filter(s => s.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`\n[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
          await sequelize.query(statement, { raw: true });
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          // If column already exists, that's OK (IF NOT EXISTS)
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  Statement ${i + 1} skipped (column/constraint already exists)`);
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
runMigration();

