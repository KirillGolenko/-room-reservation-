import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import { isDate } from '../validation/CustomDate';

export default class ReservationsAvailabilityDto {
  @ApiProperty({
    example: '2021-01-01',
    description: 'The start date of the availability',
  })
  @IsNotEmpty()
  @Validate(isDate)
  startDate: string;

  @ApiProperty({
    example: '2021-01-10',
    description: 'The end date of the availability',
  })
  @IsNotEmpty()
  @Validate(isDate)
  endDate: string;
}
