import express from 'express';
import cookieParser from "cookie-parser";
const app = express();
import authRoutes from "./routes/auth.Routes";


app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.get("/", (req, res) => {
    res.send("Backend is running");
})
app.use("/api/auth", authRoutes);
export default app;