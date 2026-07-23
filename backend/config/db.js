import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'hospital',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected successfully using Sequelize.');
  } catch (error) {
    console.error('Unable to connect to MySQL database:', error);
    process.exit(1);
  }
};

export default sequelize;