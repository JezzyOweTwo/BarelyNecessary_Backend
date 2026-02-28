import { prop,getModelForClass } from '@typegoose/typegoose';
import { Queryable} from '@/lib/Queryable'

class Item implements Queryable{
    @prop({required:true})
     public name?: string

    @prop({required:true})
    public stock_quantity?: number

    @prop({required:true})
    public image_src?: string

    @prop({required:true})
    public description?: string
}

export const ItemModel = getModelForClass(Item); // UserModel is a regular Mongoose Model with correct types