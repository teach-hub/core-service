import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
  Source,
} from "graphql";

import {
  createAdminUser,
  findAllAdminUsers,
  countAdminUsers,
  updateAdminUser,
  findAdminUser,
} from "./adminService";
import { GraphqlObjectTypeFields } from "../../graphql/utils";
import { buildEntityFields } from "../../graphql/fields";
import { buildEntityMutations } from "../../graphql/mutations";

const getFields = (isUpdate: boolean) => {
  const fields: GraphqlObjectTypeFields = {
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    name: { type: GraphQLString },
    lastName: { type: GraphQLString },
  };
  if (isUpdate) {
    fields.id = { type: GraphQLID };
    fields.password = { type: new GraphQLNonNull(GraphQLString) };
  }

  return fields;
};

const AdminUserType = new GraphQLObjectType({
  name: "AdminUser",
  description: "A role within TeachHub",
  fields: getFields(true),
});

const findAdminUserCallback = (id: string) => {
  return findAdminUser({ adminUserId: id });
};

const adminUserFields = buildEntityFields({
  type: AdminUserType,
  keyName: "AdminUser",
  typeName: "user role",
  findCallback: findAdminUserCallback,
  findAllCallback: findAllAdminUsers,
  countCallback: countAdminUsers,
});
const adminUserMutations = buildEntityMutations({
  type: AdminUserType,
  keyName: "AdminUser",
  typeName: "admin user",
  createFields: getFields(false),
  updateFields: getFields(true),
  createCallback: createAdminUser,
  updateCallback: updateAdminUser,
  findCallback: findAdminUserCallback,
});

export { adminUserMutations, adminUserFields };
