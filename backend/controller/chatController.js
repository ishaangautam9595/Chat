const Chat = require('../models/Chat');
// const { sendNotificationEmail } = require('../services/emailService');
const { validationResult } = require('express-validator');

const createOrContinueChat = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolName, teacherName, message } = req.body;
    const io = req.app.get('io');
    
    let chat = await Chat.findOne({ schoolName, teacherName, isActive: true });

    if (!chat) {
      chat = new Chat({
        schoolName,
        teacherName,
        messages: [{ sender: 'teacher', content: message, timestamp: new Date() }]
      });
    } else {
      chat.messages.push({ sender: 'teacher', content: message, timestamp: new Date() });
    }

    await chat.save();
    console.log(`Chat saved: ${chat._id}, Messages: ${chat.messages.length}, Emitting newMessage to room ${chat._id}`);
    // await sendNotificationEmail(schoolName, teacherName, message); // Commented out as per user request
    
    // Emit new message and new chat events
    io.to(chat._id.toString()).emit('newMessage', chat);
    io.emit('newChat', chat);

    res.status(200).json({ message: 'Message saved', chat });
  } catch (error) {
    console.error('Error in createOrContinueChat:', error);
    next(error);
  }
};

const getTeacherChat = async (req, res, next) => {
  try {
    const { schoolName, teacherName } = req.params;
    
    const chat = await Chat.findOne({ schoolName, teacherName, isActive: true });
    if (!chat) {
      return res.status(404).json({ error: 'No active chat found' });
    }
    
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error in getTeacherChat:', error);
    next(error);
  }
};

const getAllChats = async (req, res, next) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error in getAllChats:', error);
    next(error);
  }
};

const replyToChat = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chatId, message } = req.body;
    const io = req.app.get('io');
    
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({ error: 'Chat not found or closed' });
    }

    chat.messages.push({ sender: 'adaptmate', content: message, timestamp: new Date() });
    await chat.save();
    console.log(`Reply saved for chat: ${chatId}, Messages: ${chat.messages.length}, Emitting newMessage to room ${chatId}`);
    
    // Emit new message and updated chat events
    io.to(chatId).emit('newMessage', chat);
    io.emit('newChat', chat);

    res.status(200).json({ message: 'Reply saved', chat });
  } catch (error) {
    console.error('Error in replyToChat:', error);
    next(error);
  }
};

const closeChat = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chatId } = req.body;
    const io = req.app.get('io');
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.isActive = false;
    await chat.save();
    console.log(`Chat closed: ${chatId}, Emitting chatClosed to room ${chatId}`);
    
    // Emit chat closed and updated chat events
    io.to(chatId).emit('chatClosed', chatId);
    io.emit('newChat', chat);

    res.status(200).json({ message: 'Chat closed' });
  } catch (error) {
    console.error('Error in closeChat:', error);
    next(error);
  }
};

module.exports = {
  createOrContinueChat,
  getTeacherChat,
  getAllChats,
  replyToChat,
  closeChat
};