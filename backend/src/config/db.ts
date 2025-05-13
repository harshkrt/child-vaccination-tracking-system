import mongoose from "mongoose";

const connectDatabase = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL as string);
        console.log(`MongoDB connected successfully: ${connection.connection.host}`);
    } catch(error) {
        console.log("Connection error: ", error);
        process.exit(1);
    }
}

export default connectDatabase;