import { query } from '../db/db';

const createSellerTable = async () => {
  try {
    await query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('PostGIS extension enabled');
  } catch (err) {
    console.error('Error enabling PostGIS:', err);
  }

  const dropText = 'DROP TABLE IF EXISTS sellers;';
  const createText = `
    CREATE TABLE sellers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      image VARCHAR(355),
      number VARCHAR(255),
      location GEOMETRY(Point, 4326),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(255) DEFAULT 'user',
      is_seller_verified BOOLEAN DEFAULT FALSE,
      is_admin_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(dropText);
    console.log('Sellers table dropped');
    await query(createText);
    console.log('Sellers table created successfully with new schema');
  } catch (err) {
    console.error('Error creating sellers table:', err);
  }
};

 createSellerTable();
