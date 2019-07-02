const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const User = require('../models/user');

const router = express.Router();
require('dotenv').config();

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
});

/* POST api/user/register */
/* eslint-disable-next-line consistent-return */
router.post('/forgot', async (req, res) => {
  if (req.body.email === '') {
    res.json('email required');
  }
  const token = crypto.randomBytes(20).toString('hex');
  User.findOneAndUpdate({ email: req.body.email },{
    resetPasswordToken: token,
    resetPasswordExpires: Date.now() + 360000,
  }, (err, user) => {
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.EMAIL_ADDRESS}`,
        pass: `${process.env.EMAIL_PASSWORD}`,
      },
    });

    const mailOptions = {
      from: 'chahtup@gmail.com',
      to: `${user.email}`,
      subject: `Reset Password Requested`,
      text:
        `Yo click this link to reset yo shit` +
        `http://localhost:3001/reset/${token}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged. \n` 
    };

    transporter.sendMail(mailOptions, () => {
      if(err) {
        res.json('there was an error');
      }
      res.status(200).json('recovery email sent');
    });


  })
});

module.exports = router;