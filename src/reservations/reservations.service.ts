import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { DatabaseService } from '../database/database.service';
import responseWrapper from '../helpers/response-wrapper';
import ReservationsAvailabilityDto from './dto/reservations-availability.dto';
import ReservationsCreateDto from './dto/reservations-create.dto';

@Injectable()
export class ReservationsService {
  constructor(private databaseService: DatabaseService) {}

  getDaysDif(start: string, end: string): number {
    const startDate = dayjs(start, 'YYYY-MM-DD');
    const endDate = dayjs(end, 'YYYY-MM-DD');

    return endDate.diff(startDate, 'day');
  }

  calculateCost(days: number, price: number) {
    let discount = 0;

    if (days >= 20) {
      discount = 0.2;
    } else if (days >= 10) {
      discount = 0.1;
    }

    return {
      cost: this.applyDiscount(price * days, discount),
      discount: `${discount * 100}%`,
    };
  }

  async checkBookingAvailability(
    bookingAvailabilityDto: ReservationsAvailabilityDto,
  ) {
    const { startDate, endDate } = bookingAvailabilityDto;
    const rooms = await this.databaseService.executeQuery(
      `SELECT * FROM "ROOMS" WHERE ID NOT IN(SELECT room_id FROM "RESERVATIONS" WHERE '${startDate} ' < end_date AND '${endDate}' > start_date)`,
    );
    return responseWrapper.responseSucces(rooms);
  }

  async insertReservations(reservationsCreateDto: ReservationsCreateDto) {
    const { startDate, endDate, number } = reservationsCreateDto;

    const room = await this.databaseService.executeQuery(
      `SELECT * FROM "ROOMS" WHERE ID NOT IN(SELECT room_id FROM "RESERVATIONS" WHERE '${startDate} ' < end_date AND '${endDate}' > start_date) AND number='${number}'`,
    );

    if (!room[0]) {
      return responseWrapper.responseError(
        'Room not found or unavailable at given dates.',
      );
    }

    const difference = this.getDaysDif(startDate, endDate);
    const { cost, discount } = this.calculateCost(
      difference,
      room[0].price_per_day,
    );

    await this.databaseService.executeQuery(
      `INSERT INTO "RESERVATIONS" (room_id, start_date, end_date, cost)
      VALUES (${number}, '${startDate}', '${endDate}', ${cost})`,
    );
    return responseWrapper.responseSucces({ cost, discount });
  }

  private applyDiscount(cost: number, discount: number): number {
    return cost - cost * discount;
  }
}
