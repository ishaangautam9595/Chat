const express = require('express');
const { body, param } = require('express-validator');
const {
  createOrContinueChat,
  getTeacherChat,
  getAllChats,
  replyToChat,
  closeChat
} = require('../controller/chatController');

const router = express.Router();

router.post('/chat', [
  body('schoolName').trim().notEmpty().withMessage('School name is required'),
  body('teacherName').trim().notEmpty().withMessage('Teacher name is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
], createOrContinueChat);

router.get('/chat/:schoolName/:teacherName', [
  param('schoolName').trim().notEmpty().withMessage('School name is required'),
  param('teacherName').trim().notEmpty().withMessage('Teacher name is required')
], getTeacherChat);

router.get('/chats', getAllChats);

router.post('/chat/reply', [
  body('chatId').isMongoId().withMessage('Invalid chat ID'),
  body('message').trim().notEmpty().withMessage('Message is required')
], replyToChat);

router.post('/chat/close', [
  body('chatId').isMongoId().withMessage('Invalid chat ID')
], closeChat);

module.exports = router;