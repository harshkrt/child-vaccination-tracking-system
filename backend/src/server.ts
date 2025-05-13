import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import connectDatabase from "./config/db";
import authRoute from "./routes/authRoute";
import parentRoute from "./routes/parentRoute";
import doctorRoute from "./routes/doctorRoute";
import adminRoute from "./routes/adminRoute";
// import adminRoute from "./routes/adminRoute";
import { VaccinationSchedule } from "./models/VaccinationSchedule";

dotenv.config(); 
connectDatabase(); 

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

//Routes
app.use('/auth', authRoute);
app.use('/parent', parentRoute);
app.use('/doctor', doctorRoute);
app.use('/admin', adminRoute);
// app.use('/admin', adminRoute);
app.get("/", (req: Request, res: Response) => {
    res.send("API is running...");
});

cron.schedule("0 1 * * *", async() => {
    const now = new Date();

    try {
        const result = await VaccinationSchedule.updateMany(
            {
                status: "scheduled",
                date: { $lt: now },
            },
            {
                $set: {status: "missed" }
            }
        );
        console.log(`Missed vaccinations statuses updated to "missed" for ${result.modifiedCount} schedules.`);
    } catch (error) {
        console.error("Error updating missed vaccination statuses:", error);
    }
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});