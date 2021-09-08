import { IsNotEmpty, Validate } from 'class-validator';
import { isDate } from '../validate/CustomDate';

export default class ReservationsAvailabilityDto {
  @IsNotEmpty()
  @Validate(isDate)
  startDate: string;

  @IsNotEmpty()
  @Validate(isDate)
  endDate: string;
}
