import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./prisma/prisma.service";
import { CreateAccountController } from "./controllers/create-accoount.controller";
import { envSchema } from "./env";
import { AuthenticateController } from "./controllers/authenticate.controller";
import { AuthModule } from "./auth/auth.module";
import { CreateCashierController } from "./controllers/create-cashier.controller";
import { CreateMovementController } from './controllers/create-movement.controller';
import { ListMovementController } from "./controllers/list-movement.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule
  ],
  controllers: [CreateAccountController, AuthenticateController, CreateCashierController, CreateMovementController, ListMovementController],
  providers: [PrismaService],
})
export class AppModule {}
