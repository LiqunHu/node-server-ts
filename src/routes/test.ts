import express from 'express'
import TestControl from '@services/test/TestControl'
const router = express.Router()

router.post('/test/:method', TestControl)
export default router
