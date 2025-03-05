const mongoose=require('mongoose');
require('dotenv').config();
const dbConnection=async()=>{
    try{
await mongoose.connect(process.env.MONGO_URI);
console.log("Database Connected Successfully");
    }
    catch(error){
console.error("Database connection error:", error);
process.exit(1);
    }
}
module.exports=dbConnection;