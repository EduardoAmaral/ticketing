import express from 'express';

import { currentUser } from '@eamaral/ticketing-common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send(req.currentUser);
});

export { router as currentUserRouter };
