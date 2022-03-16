import express from 'express'
import GroupControl from '@services/admin/auth/GroupControl'
import OperatorControl from '@services/admin/auth/OperatorControl'
import OrganizationControl from '@services/admin/auth/OrganizationControl'
import OrganizationGroupControl from '@services/admin/auth/OrganizationGroupControl'
const router = express.Router()

router.post('/auth/GroupControl/:method', GroupControl)
router.post('/auth/OperatorControl/:method', OperatorControl)
router.post('/auth/OrganizationControl/:method', OrganizationControl)
router.post('/auth/OrganizationGroupControl/:method', OrganizationGroupControl)
export default router
