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
    let users = await pool.query("SELECT id, name, email, image FROM users");
    return users.rows;
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    throw error;
  }
};

export const getUsersById = async (id) => {
  try {       
    let users = await pool.query("SELECT name, email, image FROM users WHERE id =$1" [id]);
    return users.rows;
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    throw error;
  }
};

export const addUsers = async (name, email, password, image) => {
  let query = `
    INSERT INTO users(name, email, password, image)
    values($1, $2, $3, $4) RETURNING name, email, image`
  let users = await pool.query(query, [name, email, password, image])  
  return users.rows
}

export const updateUsers = async (name, email, password, image, id) =>{
  let query =`
    UPDATE users SET name = $1, email = $2, password = $3, image = $4 where id = $5 RETURNING id, name, email, image`
    let users = await pool.query(query, [nombre, email, password, imagen, id])
}

export const deleteUsersById = async (id) => {
  let users = await pool.query("DELETE FROM users WHERE id =$1, RETURNING id, name, email, image ", [id])
  return users.rows
}

export const usersLogin = async (email, password) => {
  let users = await pool.query("SELECT id, name, email  FROM users WHERE email =$1, AND password =$2", [email, password])
  return users.rows
}

export const getProducts = async () => {
  let products = await pool.query("SELECT * FROM products")
  return products.rows
}

export const getProductsPorId = async (id) => {
  let products = await pool.query("SELECT id, name, price, stock FROM productos WHERE id = $1", [id]);
  return products.rows
}

export const addProduct = async (name, description, price, stock, image) => {
  let query =`
    INSERT INTO products (name, description, price, stock, image)
    values($1, $2, $3, $4, $5) RETURNING *`
  let product = await pool.query(query, [name, description, precio, stock, image])
  return product.rows
}