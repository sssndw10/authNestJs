import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { User } from 'src/users/users.model';
import { GetRequest } from './decorators/current-user';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => User)
  async login(
    @Args({ name: 'username', type: () => String }) username,
    @Args({ name: 'password', type: () => String }) password,
  ) {
    const foundUser = await this.authService.validateUser(username, password);
    return await this.authService.login(foundUser);
  }

  @Mutation(() => User)
  async signup(
    @Args({ name: 'username', type: () => String }) username,
    @Args({ name: 'password', type: () => String }) password,
  ) {
    return await this.authService.signup(username, password);
  }

  @Query(() => User)
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(@GetRequest() req) {
    return await this.authService.refreshAccessToken(
      req.user.username,
      req.user.refreshToken,
    );
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@GetRequest() req) {
    const foundUser = await this.usersService.findUserByUsername(
      req.user.username,
    );

    return foundUser;
  }
}
