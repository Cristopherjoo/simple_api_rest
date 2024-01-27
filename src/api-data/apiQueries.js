import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'ecommerce_db',
  port: 5432,
  max: 5,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
});

export const getUsers = async () => {
  try {    
    let users = await pool.query("select id, nombre, email, imagen from users");
    return users.rows;
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    throw error;
  }
};

export const getUsersById = async (id) => {
  try {       
    let users = await pool.query("select nombre, email, imagen from users where id =$1", [id]);
    return users.rows;
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    throw error;
  }
};
