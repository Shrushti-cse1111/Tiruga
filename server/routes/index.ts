import { Router } from 'express';
import { healthRouter } from './health';
import { seedRouter } from './seed';
import { aiRouter } from './ai';
import { routeRouter } from './route';

export const apiRouter = Router();

// Mount health and readiness routes at root of /api
apiRouter.use(healthRouter);

// Mount seed administration routes
apiRouter.use(seedRouter);

// Mount AI and user authentication routes
apiRouter.use(aiRouter);

// Mount Road Route proxy route
apiRouter.use(routeRouter);

export default apiRouter;
