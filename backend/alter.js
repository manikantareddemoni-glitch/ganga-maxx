import mysql from 'mysql2/promise';

async function run() {
  try {
    const c = await mysql.createConnection({host:'localhost', user:'root', password:'Mani@2008', database:'ganga_maxx_credit'});
    await c.query("ALTER TABLE users ADD COLUMN role ENUM('admin', 'finance_manager', 'accounts_executive', 'collection_officer', 'sales_executive', 'viewer') NOT NULL DEFAULT 'viewer'");
    await c.query("UPDATE users SET role='admin' WHERE email='manikantareddemoni@gmail.com'");
    console.log('Success');
    process.exit(0);
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Field already exists');
      process.exit(0);
    }
    console.error(e);
    process.exit(1);
  }
}

run();
