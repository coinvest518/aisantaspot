import express from 'express';

const router = express.Router();

// Placeholder endpoint for additional checkout logic
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Checkout endpoint is working' });
});

export default router;
