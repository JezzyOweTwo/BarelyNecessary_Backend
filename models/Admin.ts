import { getModelForClass } from '@typegoose/typegoose';
import { User, UserPreferences } from './User';
import mongoose from 'mongoose';

class Admin extends User{}

// exports the user model for future usage
export const AdminModel = getModelForClass(Admin); // UserModel is a regular Mongoose Model with correct types