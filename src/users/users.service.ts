import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './users.model';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import daSecretos from 'src/daSecretos';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(username: string, password: string) {
    console.log(username, password);

    const encryptedPassword = await bcrypt.hash(password, daSecretos.salt);

    return await this.userModel.create({
      username,
      password: encryptedPassword,
    });
  }

  async findUserById(id: string | Types.ObjectId) {
    return typeof id === 'string'
      ? await this.userModel.findById(new Types.ObjectId(id)).exec()
      : await this.userModel.findById(id).exec();
  }

  async findUserByUsername(username: string) {
    return await this.userModel
      .findOne({
        username,
      })
      .exec();
  }

  async setUserTokensById(
    accessToken: string,
    refreshToken: string,
    userId: Types.ObjectId,
  ) {
    return await this.userModel
      .findByIdAndUpdate(userId, {
        $set: {
          accessToken,
          refreshToken,
        },
      })
      .exec();
  }
}
