import { WhereOptions } from 'sequelize/types/model';
import { Attributes, Model } from 'sequelize';

/**
 * Fields to use from sequelize model
 * when returning from services
 * */
export interface IModelFields {
  id?: number;
}

/**
 * Type of attributes to use on create
 * or update
 * */
export type ModelAttributes<T extends Model> = Attributes<T>;

/*
 * Type of where query to apply
 * on sequelize
 * */
export type ModelWhereQuery<T extends Model> = WhereOptions<Attributes<T>>;
