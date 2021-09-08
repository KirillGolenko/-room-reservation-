import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { DatabaseService } from 'src/database/database.service';
import ReservationsAvailabilityDto from './dto/reservations-availability.dto';
import ReservationsCreateDto from './dto/reservations-create.dto';

@Injectable()
export class ReservationsService {
  constructor(private databaseService: DatabaseService) {}

  private getDaysDif(start: string, end: string): number {
    const startDate = dayjs(start, 'YYYY-MM-DD');
    const endDate = dayjs(end, 'YYYY-MM-DD');

    return endDate.diff(startDate, 'day');
  }

  private calculateCost(days: number, price: number) {
    let discount = 0;

    if (days >= 20) {
      discount = 0.2;
    } else if (days >= 10) {
      discount = 0.1;
    }

    return {
      cost: this.applyDiscount(price * days, discount),
      discount: `${discount}%`,
    };
  }

  private applyDiscount(cost: number, discount: number): number {
    return cost - cost * discount;
  }

  checkBookingAvailability(
    bookingAvailabilityDto: ReservationsAvailabilityDto,
  ) {
    const { startDate, endDate } = bookingAvailabilityDto;
    return this.databaseService.executeQuery(
      `SELECT * FROM "ROOMS" WHERE ID NOT IN(SELECT room_id FROM "RESERVATIONS" WHERE '${startDate} ' < start_date AND '${endDate}' > end_date)`,
    );
  }

  async insertReservations(reservationsCreateDto: ReservationsCreateDto) {
    const { startDate, endDate, number } = reservationsCreateDto;

    const room = await this.databaseService.executeQuery(
      `SELECT * FROM "ROOMS" WHERE ID NOT IN(SELECT room_id FROM "RESERVATIONS" WHERE '${startDate} ' < start_date AND '${endDate}' > end_date) AND number='${number}'`,
    );
    if (!room[0]) {
      return {
        response: 'error',
        message: 'Room not found or unavailable at given dates.',
      };
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

    return {
      response: 'ok',
      cost,
      discount,
    };
  }
}
