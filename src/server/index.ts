import express from 'express';
import cors from 'cors';
import api from './api';
import upload from './api/upload';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// API routes
app.use('/api', api);
app.use('/api', upload);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});