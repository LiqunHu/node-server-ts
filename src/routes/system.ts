import express from 'express'
import BaseControl from '@services/system/BaseControl'
const router = express.Router()

router.post('/BaseControl/:method', BaseControl)
export default router
