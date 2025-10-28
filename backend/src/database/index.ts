/**
 * Database Configuration & Connection
 * Handles Sequelize ORM setup for PostgreSQL
 */

import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

// Database connection configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'artipanel',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: process.env.NODE_ENV === 'development' ? logger.debug : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * Initialize Database Connection
 */
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Sync models with database (creates tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database models synchronized');
    } else {
      // In production, use migrations
      await sequelize.sync({ alter: false });
      logger.info('✅ Database models verified');
    }

    return sequelize;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Seed Initial Data (run once)
 */
export async function seedDatabase() {
  try {
    // Check if data already exists
    const User = require('./models/User').default;
    const existingUsers = await User.count();

    if (existingUsers === 0) {
      logger.info('🌱 Seeding database with initial data...');

      // Import seeders
      const seedUsers = require('./seeders/01-users').default;
      const seedNodes = require('./seeders/02-nodes').default;
      const seedTemplates = require('./seeders/03-templates').default;

      // Run seeders
      await seedUsers();
      await seedNodes();
      await seedTemplates();

      logger.info('✅ Database seeded successfully');
    }
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
  }
}

/**
 * Close Database Connection
 */
export async function closeDatabase() {
  try {
    await sequelize.close();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
}

export default sequelize;
