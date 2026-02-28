import { prop, getModelForClass } from '@typegoose/typegoose';
import { Queryable } from '@/lib/Queryable';

export class User implements Queryable{
  @prop({required:true,unique:true})
  public email?: string;

  @prop({required:true})
  public passwordHash?: string;

  @prop({required:true, _id:false, type: () => Object })
  public preferences?: UserPreferences
}

// exports the user model for future usage
export const UserModel = getModelForClass(User); // UserModel is a regular Mongoose Model with correct types

export interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
}
