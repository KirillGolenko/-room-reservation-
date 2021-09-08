import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { SeedService } from './seed.service';
import { ReservationsModule } from 'src/reservations/reservations.module';

@Module({
  imports: [DatabaseModule, ReservationsModule],
  providers: [SeedService],
})
export class SeedModule {}
