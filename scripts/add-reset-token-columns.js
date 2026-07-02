const mysql = require('mysql2/promise');

async function addResetTokenColumns() {
  const connection = await mysql.createConnection(
    'mysql://jobready_kenya_db_admin:Admincyber@d7.my-control-panel.com:3306/jobready_kenya_db'
  );

  try {
    await connection.execute(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS resetToken VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS resetTokenExpires DATETIME NULL;
    `);
    console.log('✅ resetToken and resetTokenExpires columns added to users table');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Columns already exist, skipping');
    } else {
      throw err;
    }
  } finally {
    await connection.end();
  }
}

addResetTokenColumns().catch(console.error);