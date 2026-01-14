import "dotenv/config";

import app from "./app"
import { connectDB  } from "../src/config/db"

const PORT = process.env.PORT || 5000;

connectDB().then(()=>{
     app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
     })
})

