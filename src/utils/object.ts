import { isEmpty, isNil, get } from 'lodash';

export const isDefinedAndNotEmpty = <T>(value: T | null | undefined): value is T => {
  if (value === null || value === undefined) return false;

  return !(isEmpty(value) || Object.keys(value).every(key => isNil(get(value, key))));
};
