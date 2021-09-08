import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as dayjs from 'dayjs';

@ValidatorConstraint()
export class isDate implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value === 'string') {
      return dayjs(value, 'YYYY-MM-DD').isValid();
    }
    return false;
  }

  defaultMessage({ property }) {
    return `${property} must be a valid date (Required format: YYYY-MM-DD)`;
  }
}
