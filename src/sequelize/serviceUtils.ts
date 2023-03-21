import { isNumber, OrderingOptions } from '../utils';
import { WhereOptions, Model, ModelStatic, OrderItem } from 'sequelize';
import { IModelFields, ModelAttributes, ModelWhereQuery } from './types';
import { Nullable } from '../types';

export const findAllModels = async <T extends Model, U extends IModelFields>(
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

    /*
     * @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
     * keyof UserRole porque Sequelize (sus tipos para se exactos) no entiende
     * que el primer elemento de la lista en realidad son las keys del modelo.
     * */
    order: orderingOptions,
    where,
  });

  return models.map(buildModelObject);
};

export const countModels = async <T extends Model>(
  sequelizeModel: ModelStatic<T>
): Promise<number> => {
  return sequelizeModel.count({});
};

export const findModel = async <T extends Model, U extends IModelFields>(
  sequelizeModel: ModelStatic<T>,
  buildModelObject: (model: Nullable<T>) => U,
  whereQuery: ModelWhereQuery<T>
): Promise<U> => {
  const model = await sequelizeModel.findOne({
    where: whereQuery,
  });

  return buildModelObject(model);
};

export const existsModel = async <T extends Model, U extends IModelFields>(
  sequelizeModel: ModelStatic<T>,
  whereQuery: ModelWhereQuery<T>
): Promise<boolean> => {
  const [model] = await Promise.all([
    sequelizeModel.findOne({
      where: whereQuery,
    }),
  ]);

  return model !== null;
};

export const createModel = async <T extends Model, U extends IModelFields>(
  sequelizeModel: ModelStatic<T>,
  values: ModelAttributes<T>,
  buildModelObject: (model: T) => U
): Promise<U> => {
  const created = await sequelizeModel.create(values);

  return buildModelObject(created);
};

export const updateModel = async <T extends Model, U extends IModelFields>(
  sequelizeModel: ModelStatic<T>,
  values: ModelAttributes<T>,
  buildModelObject: (model: T) => U,
  whereQuery: ModelWhereQuery<T>
): Promise<U> => {
  const [_, [updated]] = await sequelizeModel.update(values, {
    where: whereQuery,
    returning: true,
  });

  return buildModelObject(updated);
};
