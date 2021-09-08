import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import * as faker from 'faker';
import * as dayjs from 'dayjs';
import { ReservationsService } from 'src/reservations/reservations.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private databaseService: DatabaseService,
    private reservationsService: ReservationsService,
  ) {}

  async seed(): Promise<void> {
    let roomsCreated = false;
    let reservationsCreated = false;
    const tableRooms = await this.databaseService.executeQuery(
      `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='ROOMS'`,
    );
    const tableReservations = await this.databaseService.executeQuery(
      `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='RESERVATIONS'`,
    );
    if (!tableRooms[0]) {
      await this.databaseService.executeQuery(
        `CREATE TABLE "ROOMS" (
        id SERIAL NOT NULL PRIMARY KEY,
        number integer UNIQUE,
        is_air_conditioning boolean,
        is_cleaning boolean,
        price_per_day integer DEFAULT 1000
    )`,
      );
      roomsCreated = true;
    }

    if (!tableReservations[0]) {
      await this.databaseService.executeQuery(
        `CREATE TABLE "RESERVATIONS" (
          id SERIAL NOT NULL PRIMARY KEY,
          room_id integer NOT NULL,
          start_date date NOT NULL,
          end_date date NOT NULL,
          cost money NOT NULL
    )`,
      );
      reservationsCreated = true;
    }
    const roomsValues = [];
    const reservationsValues = [];

    for (let i = 1; i < 51; i++) {
      const is_air_conditioning = faker.datatype.boolean();
      const is_cleaning = faker.datatype.boolean();
      const startDate = dayjs(
        faker.date.between('2021-01-01', '2022-01-02'),
      ).format('YYYY-MM-DD');

      const endDate = dayjs(
        faker.date.between('2021-01-01', '2022-01-02'),
      ).format('YYYY-MM-DD');

      const date = [startDate, endDate];
      date.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      const days = this.reservationsService.getDaysDif(date[0], date[1]);
      const { cost } = this.reservationsService.calculateCost(days, 1000);

      roomsValues.push(`(${i}, ${is_air_conditioning}, ${is_cleaning})`);
      reservationsValues.push(`(${i}, '${date[0]}', '${date[1]}', ${cost})`);
    }

    if (roomsCreated) {
      await this.databaseService.executeQuery(
        `INSERT INTO "ROOMS" ("number", is_air_conditioning, is_cleaning)
        VALUES ${roomsValues}`,
      );
    }

    if (reservationsCreated) {
      await this.databaseService.executeQuery(
        `INSERT INTO "RESERVATIONS" (room_id, start_date, end_date, cost)
            VALUES ${reservationsValues}`,
      );
    }
  }
  onModuleInit() {
    this.seed();
  }
}
