import { Sequelize } from 'sequelize';

// Verificar se as variáveis de ambiente estão definidas
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

if (!dbName || !dbUser || !dbPassword || !dbHost) {
  throw new Error('Database configuration is missing required environment variables.');
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mysql',
});

export { sequelize };

