import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/users/users.model';
import daSecretos from 'src/daSecretos';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findUserByUsername(username);

    if (!user) throw new UnauthorizedException('No user found');

    if (await bcrypt.compare(password, user.password)) {
      return user;
    }

    throw new UnauthorizedException(
      '개 ㅄㅅㄲ야 해킹하려고 하지마라 이 개ㅈ같은 새끼야',
    );
  }

  async login(user: UserDocument) {
    const payload = { username: user.username, sub: user._id };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: daSecretos.secret,
      expiresIn: '10s',
      issuer: 'Ronaldo',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: daSecretos.secret,
      expiresIn: '12h',
      issuer: 'Ronaldo',
    });

    await this.usersService.setUserTokensById(
      accessToken,
      refreshToken,
      user._id,
    );

    const daTing = await this.usersService.findUserById(user._id);

    return daTing;
  }

  async signup(username: string, password: string) {
    const foundUser = await this.usersService.findUserByUsername(username);

    if (foundUser)
      throw new BadRequestException('User already exists, login instead');

    const user = await this.usersService.createUser(username, password);

    return this.login(user);
  }

  async refreshAccessToken(username: string, refreshToken: string) {
    const user = await this.usersService.findUserByUsername(username);

    if (!user || !user.refreshToken)
      throw new UnauthorizedException('User or Token not found');

    if (user.refreshToken !== refreshToken)
      throw new UnauthorizedException('Token doesnt match');

    const newToken = await this.jwtService.signAsync(
      {
        username: user.username,
        sub: user._id,
      },
      {
        secret: daSecretos.secret,
        expiresIn: '10s',
        issuer: 'Ronaldo',
      },
    );

    await this.usersService.setUserTokensById(newToken, refreshToken, user._id);

    const daTing = await this.usersService.findUserById(user._id);

    return daTing;
  }
}
