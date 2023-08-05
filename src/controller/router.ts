import { Router } from 'express';

import database from './database';
import auth from './auth';
import users from './users';

const router = Router();

router.use('/db', database);
router.use('/auth', auth);
router.use('/users', users);

export default router;