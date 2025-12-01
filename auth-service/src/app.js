import express from "express";
//import authRoutes from './routes/authRoutes';

const app = express();

app.use(express.json());
// Import user routes
//app.use('/api/users/', require('./routes/userRoutes'));

export default app;