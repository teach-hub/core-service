import { isNumber, type OrderingOptions } from '../utils';

import type { Nullable } from '../types';
import type {
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
  where: WhereOptions = {}
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
  });

  return models.map(buildModelObject);
};

export const countModels = async <T extends Model>(
  sequelizeModel: ModelStatic<T>,
  whereQuery: WhereOptions<T> = {}
): Promise<number> => sequelizeModel.count({ where: whereQuery });

export const findModel = async <M extends Model, U>(
  sequelizeModel: ModelStatic<M>,
  buildModelObject: (model: Nullable<M>) => U,
  whereQuery: WhereOptions<M>
): Promise<U> => {
  const model = await sequelizeModel.findOne({
    where: whereQuery,
  });

  // FIXME
  // TODO. No deberiamos llamar a buildModelObject si no encontramos el
  // objeto. No tiene sentido.
  // Deberiamos simplemente devolver null.

  return buildModelObject(model);
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
  buildModelObject: (model: T) => U
): Promise<U> => {
  const created = await sequelizeModel.create(values);

  return buildModelObject(created);
};

export const bulkCreateModel = async <T extends Model, U>(
  sequelizeModel: ModelStatic<T>,
  values: CreationAttributes<T>[],
  buildModelObject: (model: T) => U
): Promise<U[]> => {
  const created = await sequelizeModel.bulkCreate(values);

  return created.map(buildModelObject);
};

export const updateModel = async <T extends Model, U>(
  sequelizeModel: ModelStatic<T>,
  values: CreationAttributes<T>,
  buildModelObject: (model: T) => U,
  whereQuery: WhereOptions<T>
): Promise<U> => {
  const [, [updated]] = await sequelizeModel.update(values, {
    where: whereQuery,
    returning: true,
  });

  return buildModelObject(updated);
};
