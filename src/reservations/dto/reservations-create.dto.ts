import { isDate, IsNotEmpty, IsNumber, Validate } from 'class-validator';
import { isValidDay } from '../validate/CustomDay';

export default class ReservationsCreateDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @Validate(isDate)
  @Validate(isValidDay)
  startDate: string;

  @IsNotEmpty()
  @Validate(isDate)
  @Validate(isValidDay)
  endDate: string;
}
