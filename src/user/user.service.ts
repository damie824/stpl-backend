import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { SignUpDto } from './dto/signUpdto';
import * as bcrypt from 'bcrypt';
import { AuthCredentialDto } from './dto/authCredentialDto';
import { Payload } from './interface/payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh.dto';

@Injectable()
export class UserService {
  private logger = new Logger('User');

  constructor(
    private readonly PrismaService: PrismaService,
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    let { username, email, password } = signUpDto;

    let salt = await bcrypt.genSalt();
    let hash = await bcrypt.hash(password, salt);

    password = hash;

    try {
      let result = this.PrismaService.user.create({
        data: {
          username,
          email,
          password,
        },
      });
      this.logger.verbose(`Someone generated new account with email ${email}.`);
      return result;
    } catch (e) {
      this.logger.warn(e.code);
    }
  }

  async validationUser(authCredentialDto: AuthCredentialDto): Promise<User> {
    const user = await this.PrismaService.user.findUnique({
      where: {
        email: authCredentialDto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        `Can't find user who has email ${authCredentialDto.email}.`,
      );
    }

    if (!(await bcrypt.compare(authCredentialDto.password, user.password))) {
      this.logger.warn(`Someone tried to login with unknown password`);
      throw new UnauthorizedException('Password not matched.');
    }

    return user;
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload: Payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    return this.JwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
    });
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload: Payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    return this.JwtService.signAsync(
      { id: payload.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION_TIME',
        ),
      },
    );
  }

  async getCurrentHashedRefreshToken(refreshToken: string): Promise<string> {
    const saltOrRounds = 10;
    const currentRefreshToken = await bcrypt.hash(refreshToken, saltOrRounds);
    return currentRefreshToken;
  }

  async getCurrentRefreshTokenExp(refreshToken: string): Promise<Date> {
    const currentDate = new Date();
    const currentRefreshTokenExp = new Date(
      currentDate.getTime() +
        parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')),
    );
    return currentRefreshTokenExp;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentRefreshToken =
      await this.getCurrentHashedRefreshToken(refreshToken);
    const currentRefreshTokenExp =
      await this.getCurrentRefreshTokenExp(refreshToken);
    await this.PrismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refresh: currentRefreshToken,
        refreshExp: currentRefreshTokenExp,
      },
    });
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ): Promise<User> {
    const user: User = await this.PrismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user.refresh) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refresh,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async removeRefreshToken(userId: number): Promise<any> {
    return await this.PrismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refresh: null,
        refreshExp: null,
      },
    });
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    const { refresh_token } = refreshTokenDto;

    const decodedRefreshToken = this.JwtService.verify(refresh_token, {
      secret: process.env.JWT_REFRESH_SECRET,
    }) as Payload;

    const userId = decodedRefreshToken.id;
    const user = await this.getUserIfRefreshTokenMatches(refresh_token, userId);

    if (!user) {
      throw new UnauthorizedException('Caught invaild user.');
    }

    const accessToken = await this.generateAccessToken(user);
    return { accessToken };
  }

  async findUserById(userId: number): Promise<User> {
    const user = this.PrismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  }
}
