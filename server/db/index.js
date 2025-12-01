require('dotenv').config();

const DB_TYPE = process.env.DB_TYPE || 'mongodb';
let ManagerClass;

if (DB_TYPE === 'mongodb'|| DB_TYPE === 'mongo') {
  ManagerClass = require('./mongodb');
} else if (DB_TYPE === 'postgresql') {
  ManagerClass = require('./postgresql');
} else {
  throw new Error('Unknown DB_TYPE in .env');
}

const manager = new ManagerClass();

(async () => {
  await manager.connect();
})();

module.exports = manager;


