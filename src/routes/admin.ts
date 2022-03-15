import express from 'express'
import GroupControl from '@services/admin/auth/GroupControl'
import OperatorControl from '@services/admin/auth/OperatorControl'
const router = express.Router()

router.post('/auth/GroupControl/:method', GroupControl)
router.post('/auth/OperatorControl/:method', OperatorControl)
export default router
