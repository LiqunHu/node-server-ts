import express from 'express'
import AuthControl from '@services/auth/AuthControl'
const router = express.Router()

router.post('/:method', AuthControl)
export default router