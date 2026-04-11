import express from 'express';
import cors from 'cors';

import adminRoutes from './routes/admin-routes.js';
import userRoutes from './routes/user-routes.js';

const app = express(); 

app.use(cors());
app.use(express.json());
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});