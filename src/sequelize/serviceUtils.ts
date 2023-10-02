import { isNumber, type OrderingOptions } from '../utils';

import type {
  Transaction,
  Attributes,
  CreationAttributes,
  Model,
  ModelStatic,
  OrderItem,
  WhereOptions,
} from 'sequelize';

export const findAllModels = async <T extends Model, U>(
  sequelizeModel: ModelStatic<T>,
  options: OrderingOptions,
  buildModelObject: (model: T) => U,
  where: WhereOptions = {},
  transaction?: Transaction
): Promise<U[]> => {
  const paginationOptions =
    isNumber(options.perPage) && isNumber(options.page)
      ? {
          limit: options.perPage,
          offset: options.page * options.perPage,
        }
      : {};

  const orderingOptions: OrderItem[] = options.sortField
    ? [[options.sortField, options.sortOrder ?? 'DESC']]
    : [];

  const models: T[] = await sequelizeModel.findAll({
    ...paginationOptions,
    order: orderingOptions,
    where,
    transaction,
  });

  return models.map(buildModelObject);
};

export const countModels = async <T extends Model>(
  sequelizeModel: ModelStatic<T>,
  whereQuery: WhereOptions<T> = {},
  transaction?: Transaction
): Promise<number> => sequelizeModel.count({ where: whereQuery, transaction });

export const findModel = async <M extends Model, U>(
  sequelizeModel: ModelStatic<M>,
  buildModelObject: (model: M) => U,
  whereQuery: WhereOptions<M>,
  transaction?: Transaction
): Promise<U | null> => {
  const model = await sequelizeModel.findOne({
    where: whereQuery,
    transaction,
  });

  return model ? buildModelObject(model) : null;
};

export const existsModel = async <T extends Model>(
  sequelizeModel: ModelStatic<T>,
  whereQuery: WhereOptions<T>
): Promise<boolean> => {
  const model = await sequelizeModel.findOne({
    where: whereQuery,
  });

  return model !== null;
};

export const createModel = async <T extends Model, U>(
  sequelizeModel: ModelStatic<T>,
  values: CreationAttributes<T>,
  buildModelObject: (model: T) => U,
  transaction?: Transaction
): Promise<U | null> => {
  const created = await sequelizeModel.create(values, { transaction });

  return created ? buildModelObject(created) : null;
};

export const bulkCreateModel = async <T extends Model, U>(
  sequelizeModel: ModelStatic<T>,
  values: CreationAttributes<T>[],
  buildModelObject: (model: T) => U,
  transaction?: Transaction
): Promise<U[]> => {
  const created = await sequelizeModel.bulkCreate(values, { transaction });

  return created.map(buildModelObject);
};

export const destroyModel = async <T extends Model>(
  sequelizeModel: ModelStatic<T>,
  whereQuery: WhereOptions<T>,
  transaction?: Transaction
): Promise<number> => {
  const result = await sequelizeModel.destroy({ where: whereQuery, transaction });

  return result;
};

export const updateModel = async <T extends Model, U>(
  sequelizeModel: ModelStatic<T>,
  values: Partial<Attributes<T>>,
  buildModelObject: (model: T) => U,
  whereQuery: WhereOptions<T>,
  transaction?: Transaction
): Promise<U> => {
  const [, [updated]] = await sequelizeModel.update(values, {
    where: whereQuery,
    returning: true,
    transaction,
  });

  return buildModelObject(updated);
};
