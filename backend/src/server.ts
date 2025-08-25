import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import connectDatabase from "./config/db";

import publicRoute from "./routes/publicRoute";
import authRoute from "./routes/authRoute";
import parentRoute from "./routes/parentRoute";
import doctorRoute from "./routes/doctorRoute";
import adminRoute from "./routes/adminRoute";
import { VaccinationSchedule } from "./models/VaccinationSchedule";

dotenv.config();
connectDatabase();

const app: Application = express();
const backendPort = process.env.PORT || 5000;


const allowedOrigins = [
  "https://child-vaccination-tracking-system.vercel.app",
  "http://localhost:5173",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    console.log(`CORS request received from: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for: ${origin}`);
      callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept', 'Cache-Control'],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/api/auth', authRoute);
app.use('/api/parent', parentRoute);
app.use('/api/doctor', doctorRoute);
app.use('/api/admin', adminRoute);
app.use('/api', publicRoute);

app.get("/api", (req: Request, res: Response) => {
    res.send("API base is running...");
});

cron.schedule("0 1 * * *", async() => {
    console.log("Running cron job: Updating missed vaccination statuses...");
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
        console.log(`Cron: ${result.modifiedCount} vaccination schedules updated to "missed".`);
    } catch (error) {
        console.error("Cron: Error updating missed vaccination statuses:", error);
    }
});

app.use(((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack || err.message || err);
  if (err.message && err.message.startsWith('CORS policy does not allow access')) {
    return res.status(403).json({ message: "Access Denied: Your origin is not permitted by CORS policy." });
  }
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected internal server error occurred.',
  });
}) as express.ErrorRequestHandler);

app.listen(backendPort, () => {
  console.log(`Backend server is running on http://localhost:${backendPort}`);
  console.log("CORS policy allows frontend requests from:", allowedOrigins);
});