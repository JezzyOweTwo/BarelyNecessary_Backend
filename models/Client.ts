import { prop, getModelForClass } from '@typegoose/typegoose';
import { User, UserPreferences } from './User';

class Client extends User{}

// exports the client model for future usage
export const ClientModel = getModelForClass(Client); // UserModel is a regular Mongoose Model with correct types