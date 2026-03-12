export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  password: string;
  phone: string | null;
  role: 'customer' | 'admin';
  is_active: number;
  created_at: string;
  updated_at: string;
}
// import { prop, getModelForClass } from '@typegoose/typegoose';

// export class User {
//   @prop({required:true,unique:true})
//   public email?: string;

//   @prop({required:true})
//   public passwordHash?: string;

//   @prop({required:true, _id:false, type: () => Object })
//   public preferences?: UserPreferences
// }

// // exports the user model for future usage
// export const UserModel = getModelForClass(User); 

// export interface UserPreferences {
//   theme: 'light' | 'dark';
//   fontSize: number;
// }
