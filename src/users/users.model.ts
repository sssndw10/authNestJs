import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
@ObjectType()
export class User {
  @Field(() => ID)
  _id: mongoose.Types.ObjectId;

  @Field(() => String)
  @Prop()
  username: string;

  @Field(() => String)
  @Prop()
  password: string;

  @Field(() => String, { nullable: true })
  @Prop()
  accessToken?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
