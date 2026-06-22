import mysql from 'mysql2/promise';

async function run() {
  try {
    const c = await mysql.createConnection({host:'localhost', user:'root', password:'Mani@2008', database:'ganga_maxx_credit'});
    await c.query("UPDATE users SET role='admin' WHERE email='admin@gangamaxx.com'");
    await c.query("UPDATE users SET role='finance_manager' WHERE email='accounts@gangamaxx.com'");
    await c.query("UPDATE users SET role='sales_executive' WHERE email='sales@gangamaxx.com'");
    await c.query("UPDATE users SET role='collection_officer' WHERE email='collections@gangamaxx.com'");
    console.log('Updated users successfully');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
