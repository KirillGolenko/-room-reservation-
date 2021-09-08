import { ApiProperty } from '@nestjs/swagger';
import { isDate, IsNotEmpty, IsNumber, Validate } from 'class-validator';
import { isValidDay } from '../validation/CustomDay';

export default class ReservationsCreateDto {
  @ApiProperty({
    example: 1,
    description: 'The number room',
  })
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @ApiProperty({
    example: '2021-01-01',
    description: 'The start date of the availability',
  })
  @IsNotEmpty()
  @Validate(isDate)
  @Validate(isValidDay)
  startDate: string;

  @ApiProperty({
    example: '2021-01-10',
    description: 'The end date of the availability',
  })
  @IsNotEmpty()
  @Validate(isDate)
  @Validate(isValidDay)
  endDate: string;
}
