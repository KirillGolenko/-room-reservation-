import { Injectable, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { DatabaseService } from '../database/database.service';
import responseWrapper from '../helpers/response-wrapper';
import ReservationsAvailabilityDto from './dto/reservations-availability.dto';
import ReservationsCreateDto from './dto/reservations-create.dto';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

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

  async sendReport(bookingAvailabilityDto) {
    const { startDate, endDate } = bookingAvailabilityDto;
    const allmonth = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    let reservations;

    try {
      reservations = await this.databaseService.executeQuery(
        `SELECT * FROM "RESERVATIONS" WHERE ID IN(SELECT room_id FROM "RESERVATIONS" WHERE '${startDate}' < end_date AND '${endDate}' > start_date)`,
      );
    } catch (err) {
      this.logger.error(err);
    }

    const report = reservations.reduce((acc, reservation) => {
      const { room_id, start_date, end_date } = reservation;
      let percent: number, daysInMonth: number, monthKey: string;

      if (dayjs(start_date).format('MMMM') === dayjs(end_date).format('MMMM')) {
        const days = this.getDaysDif(start_date, end_date);
        daysInMonth = dayjs(start_date).daysInMonth();
        percent = (days / daysInMonth) * 100;
        monthKey = dayjs(start_date).format('YYYY-MMMM');
      } else {
        [start_date, end_date].forEach((date) => {
          daysInMonth = dayjs(date).daysInMonth();
          const day = +dayjs(date).format('DD');
          const remainder = daysInMonth - day;
          percent = (remainder / daysInMonth) * 100;
          monthKey = dayjs(date).format('YYYY-MMMM');
          const monthReport = {
            room_id,
            percent: `${percent.toFixed(2)}%`,
          };

          !acc[monthKey]
            ? (acc[monthKey] = [monthReport])
            : acc[monthKey].push(monthReport);
        });

        for (
          let i = allmonth.indexOf(dayjs(start_date).format('MMMM')) + 1;
          i < allmonth.indexOf(dayjs(end_date).format('MMMM'));
          i++
        ) {
          const year = dayjs(start_date).format('YYYY');
          const monthKey = `${year}-${allmonth[i]}`;
          const monthReport = {
            room_id,
            percent: '100%',
          };

          !acc[monthKey]
            ? (acc[monthKey] = [monthReport])
            : acc[monthKey].push(monthReport);
        }
      }

      const monthReport = {
        room_id,
        percent: `${percent.toFixed(2)}%`,
      };

      !acc[monthKey]
        ? (acc[monthKey] = [monthReport])
        : acc[monthKey].push(monthReport);

      return acc;
    }, {});

    return report;
  }

  private applyDiscount(cost: number, discount: number): number {
    return cost - cost * discount;
  }
}
