import { Router } from 'express';
const router = Router();

import weatherRoutes from './api/weatherRoutes';

router.use('/weather', weatherRoutes);

export default router;
