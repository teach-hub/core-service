import {isNumber, OrderingOptions} from "../utils";
import {Model, ModelStatic} from "sequelize";

export const findAllModels = async <T extends Model>(
  options: OrderingOptions,
  sequelizeModel: ModelStatic<T>,
  buildModelObject: (model: T) => any
) => {
  const paginationOptions = isNumber(options.perPage) && isNumber(options.page)
    ?
    {
      limit: options.perPage,
      offset: options.page * options.perPage
    } : {};

  const orderingOptions = options.sortField
    ?
    [
      [ options.sortField, options.sortOrder?? 'DESC' ]
    ] : [];

  // @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
  // keyof UserRole porque Sequelize (sus tipos para se exactos) no entiende
  // que el primer elemento de la lista en realidad son las keys del modelo.

  const models: T[] = await sequelizeModel.findAll({ ...paginationOptions, order: orderingOptions });

  return models.map(buildModelObject)
}

export const countModels = async <T extends Model>(
  sequelizeModel: ModelStatic<T>
) => {
  return sequelizeModel.count({})
};


export const findModel = async <T extends Model>(
  id: string,
  sequelizeModel: ModelStatic<T>,
  buildModelObject: (model: T | null) => any,
  buildQuery: (id: number) => any
) => {
  const model = await sequelizeModel.findOne(
    {
      where: buildQuery(Number(id))
    }
  );

  return buildModelObject(model)
}

export const createModel = async <T extends Model>(
  sequelizeModel: ModelStatic<T>,
  values: any,
  buildModelObject: (model: T) => any,
) => {
  const created = await sequelizeModel.create(values);

  return buildModelObject(created)
}

export const updateModel = async <T extends Model>(
  sequelizeModel: ModelStatic<T>,
  id: string,
  values: any,
  buildModelObject: (model: T) => any,
  buildQuery: (id: number) => any
) => {

  const [_, [updated]] = await sequelizeModel.update(
    values,
    {
      where: buildQuery(Number(id)),
      returning: true
    }
  );

  return buildModelObject(updated)
}
