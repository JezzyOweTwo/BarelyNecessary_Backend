
// const image_store=null; // db connection object  
// const CONNECTION_STRING=`${process.env.IMAGES_HOST}:${process.env.IMAGES_PORT}`;

// export async function init_image_store(){
//     try{
//         get_image_store();
//         console.log(`Sucessfully Connected to Image Store!`);
//     }   catch (err){
//         console.error(err);
//     }
// }

// // lazily initalized db connection
// async function get_image_store(){
//     if (image_store)
//         return image_store

//     // initalize minio connection
// }

// export async function test_image_store_connection(){
//     try{
//         const imgStore = get_image_store();
//         // try rerieving and uploading images 
//     }   catch (err){
//         console.error(err);
//     }
// }

// export async function query_image_store(query:String){
//     try{
//         const imgStore = get_image_store(); // gets connection object
//         var image;                          // retrieves an image 
//         return image;
//     }   catch (err){
//         console.error(err);
//     }
// }




// returns a queryable string for the product image.
export function format_product_query(productID:number):string{
    return `/api/images/${productID}`;
}