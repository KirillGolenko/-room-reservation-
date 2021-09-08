import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as dayjs from 'dayjs';

@ValidatorConstraint()
export class isValidDay implements ValidatorConstraintInterface {
  validate(value: any) {
    const day = dayjs(value).day();
    return day !== 4 && day !== 1;
  }

  defaultMessage({ property }) {
    return `${property} can\`t be Monday and Thursday`;
  }
}
