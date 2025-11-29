import { query } from '../db/db';

const createUsersTable = async () => {
  const dropText = 'DROP TABLE IF EXISTS users;';
  const createText = `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      image VARCHAR(355),
      age INTEGER,
      number VARCHAR(255),
      location VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      bio TEXT,
      mobile_number VARCHAR(255),
      is_seller_verified BOOLEAN DEFAULT FALSE,
      is_admin_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(dropText);
    console.log('Users table dropped');
    await query(createText);
    console.log('Users table created successfully with new schema');
  } catch (err) {
    console.error('Error creating users table:', err);
  }
};

createUsersTable();
