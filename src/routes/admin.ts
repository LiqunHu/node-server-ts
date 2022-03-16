import express from 'express'
import GroupControl from '@services/admin/auth/GroupControl'
import OperatorControl from '@services/admin/auth/OperatorControl'
import OrganizationControl from '@services/admin/auth/OrganizationControl'
import OrganizationGroupControl from '@services/admin/auth/OrganizationGroupControl'
import OrganizationTemplateControl from '@services/admin/auth/OrganizationTemplateControl'
import OrganizationUserControl from '@services/admin/auth/OrganizationUserControl'
const router = express.Router()

router.post('/auth/OrganizationControl/:method', OrganizationControl)
router.post(
  '/auth/OrganizationTemplateControl/:method',
  OrganizationTemplateControl
)
router.post('/auth/OrganizationGroupControl/:method', OrganizationGroupControl)
router.post('/auth/OrganizationUserControl/:method', OrganizationUserControl)
router.post('/auth/GroupControl/:method', GroupControl)
router.post('/auth/OperatorControl/:method', OperatorControl)

export default router
