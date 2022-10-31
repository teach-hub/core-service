import { Sequelize } from 'sequelize';

/* TODO: Usar dotenv o algo parecido. */

const DB_URL = process.env.DB_URL || 'postgres://postgres@localhost:5432/teachhub';

const sequelize = new Sequelize(DB_URL);

console.log('Connected to db!');

export default sequelize;
