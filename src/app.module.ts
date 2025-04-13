import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import envConfig from './common/config/envConfig';
import { DatabaseModule } from './common/database/database.module';
import { selectEnv } from './common/env/config';
import { UsersModule } from './modules/users/user/users.module';
import { GlobalLoggerMiddleware } from './middlewares/globalLogger';
import { AuthModule } from './modules/auth/auth.module';
import { HouseModule } from './modules/house/house.module';
import { AdminModule } from './modules/users/admin/admin.module';
import { SingleCostModule } from './modules/single-cost/single-cost.module';
import { HouseCostModule } from './modules/house-cost/house-cost.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: selectEnv(),
			isGlobal: true,
			load: [envConfig],
		}),
		DatabaseModule,
		UsersModule,
		AuthModule,
		HouseModule,
		AdminModule,
		SingleCostModule,
		HouseCostModule,
	],
	controllers: [],
	providers: [Logger],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(GlobalLoggerMiddleware).forRoutes('*');
	}
}
