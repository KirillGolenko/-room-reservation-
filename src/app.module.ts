import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SeedService } from './seed/seed.service';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    ReservationsModule,
    SeedModule,
  ],
  controllers: [],
  providers: [SeedService],
})
export class AppModule {}
