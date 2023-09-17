import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { SignUpDto } from './dto/signUpdto';
import { User } from '@prisma/client';
import { AuthCredentialDto } from './dto/authCredentialDto';
import { JwtAccessAuthGuard } from 'src/guard/jwt-access.guard';
import { RefreshTokenDto } from './dto/refresh.dto';
import { JwtRefreshGuard } from 'src/guard/jwt-refresh.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  createUser(@Body(ValidationPipe) SignUpDto: SignUpDto): Promise<User> {
    return this.userService.signUp(SignUpDto);
  }

  @Post('login')
  async login(
    @Body(ValidationPipe) AuthCredentialDto: AuthCredentialDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<object> {
    const user = await this.userService.validationUser(AuthCredentialDto);
    const access_token = await this.userService.generateAccessToken(user);
    const refresh_token = await this.userService.generateRefreshToken(user);

    await this.userService.setCurrentRefreshToken(refresh_token, user.id);

    res.setHeader('Authorization', 'Bearer' + [access_token, refresh_token]);
    res.cookie('access_token', access_token, {
      httpOnly: true,
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
    });

    return {
      message: 'login success',
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const newAccessToken = (await this.userService.refresh(refreshTokenDto))
        .accessToken;
      res.setHeader('Authorization', 'Bearer ' + newAccessToken);
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
      });
      res.send({ newAccessToken });
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  async logOut(@Req() req: any, @Res() res: Response): Promise<any> {
    await this.userService.removeRefreshToken(req.user.id);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.send({
      message: 'logout success',
    });
  }

  @Get('auth')
  @UseGuards(JwtAccessAuthGuard)
  async authUser(@Req() req: any, @Res() res: Response): Promise<any> {
    const userId: number = req.user.id;
    const verifiedUser: User = await this.userService.findUserById(userId);
    return res.send(verifiedUser);
  }
}
