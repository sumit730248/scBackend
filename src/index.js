import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT;

connectDB()
.then(() => {
    app.on("error" , (error) => {
        console.log("ERR: ", error);
        throw error;
    })
    app.listen( PORT || 8000, () => {
        console.log(` server is running at Port: ${PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection Failed !!! ", err);
})
