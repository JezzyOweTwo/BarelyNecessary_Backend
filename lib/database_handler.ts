//import { ReturnModelType } from "@typegoose/typegoose";
import mysql from "mysql2";
// TODO: add a 'query' class to make searching by parameters easier
// TODO: add another method for searching by a query
// this shit is completely untested, lmfao. I'm going based on pure vibes atm.

// params: 
// queries for every instance of that model in the database. 

// returns:
// an array of that model
export async function getAll<T extends Object>(model:ReturnModelType<any>,cls: new () => T):Promise<T[]>{
    const all_results = await model.find().lean().exec();
    const typed_results:T[] = []; 

    for (const result of all_results){
        typed_results.push(Object.assign(new cls(), result));
    }

    return typed_results;
}

// returns:
// the first instance of a given model in the database
export async function getFirst<T extends Object>(model:ReturnModelType<any>,cls: new () => T):Promise<T>{
    const result = await model.findOne().lean().exec();
    const typed_result:T = Object.assign(new cls(), result);
    return typed_result;
}

// returns:
// Applies a search query and returns an array of all matching objects


// returns:
//  the object with a matching Mongo DB id in the database.
export async function getById<T extends Object>(model:ReturnModelType<any>,id:string,cls: new () => T):Promise<T>{
    const result = await model.findById(id).lean().exec();
    const typed_result:T = Object.assign(new cls(), result);
    return typed_result;
}

// returns a boolean on whether or not the model exists
export async function exists<T extends Object>(model:ReturnModelType<any>,filter:object,cls: new () => T):Promise<Boolean>{
    return await model.exists(filter).lean().exec();
}

