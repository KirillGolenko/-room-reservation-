import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import ReservationsAvailabilityDto from './dto/reservations-availability.dto';
import ReservationsCreateDto from './dto/reservations-create.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('/availability')
  checkBookingAvailability(
    @Query() bookingAvailabilityDto: ReservationsAvailabilityDto,
  ) {
    return this.reservationsService.checkBookingAvailability(
      bookingAvailabilityDto,
    );
  }

  @Post()
  insertReservations(@Body() reservationsCreateDto: ReservationsCreateDto) {
    return this.reservationsService.insertReservations(reservationsCreateDto);
  }
}
