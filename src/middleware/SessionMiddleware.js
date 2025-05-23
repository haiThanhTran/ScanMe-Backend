const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Middleware để cấu hình session và các middleware liên quan
const setupSessionMiddleware = (app) => {
  // Middleware xử lý JSON body
  app.use(express.json());

  // Middleware xử lý urlencoded body (dành cho form data)
  app.use(express.urlencoded({ extended: true }));

  // Sử dụng express-session
  app.use(
    session({
      secret: process.env.JWT_SECRET_KEY,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // Only use secure in production
        maxAge: 60 * 60 * 1000, // 1 hour
      },
    })
  );

  // Khởi tạo passport
  app.use(passport.initialize());
  app.use(passport.session());
};

module.exports = setupSessionMiddleware; 
