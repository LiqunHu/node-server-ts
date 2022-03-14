import express from 'express'
import GroupControl from '@services/admin/auth/GroupControl'
const router = express.Router()

router.post('/auth/GroupControl/:method', GroupControl)
export default router
