import { Global, Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';

@Global()
@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [UserController],
  providers: [UserService, JwtRefreshStrategy, JwtService],
})
export class UserModule {}
