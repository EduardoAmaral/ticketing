import express from 'express';

import { currentUser, requireAuth } from '@eamaral/ticketing-common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, requireAuth, (req, res) => {
  res.send(req.currentUser);
});

export { router as currentUserRouter };
