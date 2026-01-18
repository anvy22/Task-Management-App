import "dotenv/config";

import { server } from "./app"
import { connectDB } from "../src/config/db"

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
   server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
   })
})

