import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error-handler.js';
import router from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(router);


app.use((_req, res) => {
    return res.status(404).json({
        ok: false,
        message: "Route not found"
    });
});

app.use(errorHandler);

export default app;
