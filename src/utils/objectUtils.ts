import _ from 'lodash';

export const isDefinedAndNotEmpty = <T>(value: T | null | undefined): value is T => {
  if (value === null || value === undefined) return false;

  return !(
    _.isEmpty(value) || Object.keys(value).every(key => _.isNil(_.get(value, key)))
  );
};
