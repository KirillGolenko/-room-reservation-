import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  const mockRepository = {
    executeQuery() {
      return [
        {
          id: 1,
          number: 1,
          is_air_conditioning: true,
          is_cleaning: false,
          price_per_day: 1000,
        },
      ];
    },
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: DatabaseService, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  describe('getDaysDif', () => {
    it('should correctly calculate DaysDif', async () => {
      const item1 = {
        start: '2021-01-01',
        end: '2021-01-02',
      };

      const item2 = {
        start: '2021-07-30',
        end: '2021-08-05',
      };

      const item3 = {
        start: '2021-02-10',
        end: '2021-02-20',
      };

      const desiredResult1 = 1;
      const result1 = service.getDaysDif(item1.start, item1.end);

      expect(result1).toEqual(desiredResult1);

      const desiredResult2 = 6;
      const result2 = service.getDaysDif(item2.start, item2.end);

      expect(result2).toEqual(desiredResult2);

      const desiredResult3 = 10;
      const result3 = service.getDaysDif(item3.start, item3.end);

      expect(result3).toEqual(desiredResult3);
    });
  });

  describe('calculateCost', () => {
    it('should correctly calculate cost', async () => {
      const item1 = {
        days: 5,
        price: 1000,
      };

      const item2 = {
        days: 15,
        price: 1000,
      };

      const item3 = {
        days: 21,
        price: 1000,
      };

      const desiredResult1 = { cost: 5000, discount: '0%' };
      const result1 = service.calculateCost(item1.days, item1.price);

      expect(result1).toEqual(desiredResult1);

      const desiredResult2 = { cost: 13500, discount: '10%' };
      const result2 = service.calculateCost(item2.days, item2.price);

      expect(result2).toEqual(desiredResult2);

      const desiredResult3 = { cost: 16800, discount: '20%' };
      const result3 = service.calculateCost(item3.days, item3.price);

      expect(result3).toEqual(desiredResult3);
    });
  });

  describe('getDaysDif', () => {
    it('should return the coffee object', async () => {
      const item1 = {
        startDate: '2021-01-01',
        endDate: '2021-02-01',
      };
      const expectedResult = [
        {
          id: 1,
          number: 1,
          is_air_conditioning: true,
          is_cleaning: false,
          price_per_day: 1000,
        },
      ];

      const { data } = await service.checkBookingAvailability(item1);
      expect(data).toEqual(expectedResult);
    });
  });
});
