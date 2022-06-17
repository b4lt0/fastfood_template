const mongoose =require('mongoose');
const errorHandler = require("../middlewares/errorHandler");
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
    try{
        await mongoose
            .connect(process.env.DATABASE_URI, {
                useUnifiedTopology : true,
                useNewUrlParser : true
            });
    }
    catch(error){
        errorHandler(error);
    }
}

module.exports = connectDB;