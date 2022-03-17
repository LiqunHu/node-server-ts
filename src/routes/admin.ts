import express from 'express'
import GroupControl from '@services/admin/auth/GroupControl'
import OperatorControl from '@services/admin/auth/OperatorControl'
import OrganizationControl from '@services/admin/auth/OrganizationControl'
import OrganizationGroupControl from '@services/admin/auth/OrganizationGroupControl'
import OrganizationTemplateControl from '@services/admin/auth/OrganizationTemplateControl'
import OrganizationUserControl from '@services/admin/auth/OrganizationUserControl'
import ResetPasswordControl from '@services/admin/auth/ResetPasswordControl'
import SystemApiControl from '@services/admin/auth/SystemApiControl'
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
router.post('/auth/ResetPassword/:method', ResetPasswordControl)
router.post('/auth/SystemApiControl/:method', SystemApiControl)

export default router
