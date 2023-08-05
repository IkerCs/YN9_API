import { Router } from 'express';
import { apiKeyAuth } from '../../middlewares';
import get from './get';
import post from './post';
import put from './put';
import del from './delete';

const router = Router();
router.get('/', apiKeyAuth, get.index);
router.get('/param', apiKeyAuth, get.param);
router.get('/activeWarnings', apiKeyAuth, get.activeWarnings);

router.post('/prefixes', apiKeyAuth, post.prefixes);
router.post('/antiInvites', apiKeyAuth, post.antimod);
router.post('/antiLinks', apiKeyAuth, post.antimod);
router.post('/antiMayus', apiKeyAuth, post.antimod);
router.post('/antiFlood', apiKeyAuth, post.antimod);
router.post('/welcomes', apiKeyAuth, post.publication);
router.post('/leaves', apiKeyAuth, post.publication);
router.post('/messageLogs', apiKeyAuth, post.logs);
router.post('/mediaLogs', apiKeyAuth, post.logs);
router.post('/memberLogs', apiKeyAuth, post.logs);
router.post('/reactionLogs', apiKeyAuth, post.logs);
router.post('/commandLogs', apiKeyAuth, post.logs);
router.post('/warnings', apiKeyAuth, post.warnings);
router.post('/confessions', apiKeyAuth, post.confessions);
router.post('/ignore', apiKeyAuth, post.ignore);
router.post('/muteRole', apiKeyAuth, post.muteRole);
router.post('/commands', apiKeyAuth, post.command);

router.put('/', apiKeyAuth, put.index);

router.delete('/', apiKeyAuth, del.index);
router.delete('/commands', apiKeyAuth, del.commands);
router.delete('/prefixes', apiKeyAuth, del.prefixes);
router.delete('/warnings', apiKeyAuth, del.warnings);

export default router;