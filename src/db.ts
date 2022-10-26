import { Sequelize, DataTypes, QueryTypes } from 'sequelize';

/* TODO: Usar dotenv o algo parecido. */

const sequelize = new Sequelize('postgres://postgres@localhost:5432/teachhub');

console.log('Connected to db!');

export default sequelize;
