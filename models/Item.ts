export interface Item {
  product_id: number;
  category_id: number | null;
  name: string;
  brand: string | null;
  model: string | null;
  short_tagline: string | null;
  description: string;
  price: string;
  stock_quantity: number;
  image_url: string | null;
  is_featured: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// import { prop,getModelForClass } from '@typegoose/typegoose';

// class Item {
//     @prop({required:true})
//      public name?: string

//     @prop({required:true})
//     public stock_quantity?: number

//     @prop({required:true})
//     public image_src?: string

//     @prop({required:true})
//     public description?: string
// }

// export const ItemModel = getModelForClass(Item); // UserModel is a regular Mongoose Model with correct types