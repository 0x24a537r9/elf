'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator');

/**
 * Generates a random 64-bit ID and encodes it in base64.
 * Adapted from http://goo.gl/IkysrS.
 */
function generateRandomId() {
  return crypto.randomBytes(8)  // Generate a random 64-bit integer,
      .toString('base64')       // convert to base64 format,
      .substr(0, 11)            // return 11 characters,
      .replace(/\+/g, '-')      // replace '+' with '-', and
      .replace(/\//g, '_');     // replace '/' with '_'.
}

/** Gets this year's Christmas date. */
function getNextChristmasDate() {
  return new Date().getFullYear() + '-12-25T00:00:00.000Z';
}

/**
 * Member Schema
 */
var MemberSchema = new Schema({
  _id: {
    type: String,
    default: generateRandomId
  },
  displayName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
    validate: [validator.isEmail, 'Please fill a valid email address']
  },
  has: {
    type: String,
    ref: 'Member'
  }
});

mongoose.model('Member', MemberSchema);

/**
 * Group Schema
 */
var GroupSchema = new Schema({
  _id: {
    type: String,
    default: generateRandomId
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'Please specify an owner'
  },
  displayName: {
    type: String,
    trim: true,
    required: 'Please fill in group name'
  },
  members: [MemberSchema],
  eventDate: {
    type: Date,
    default: getNextChristmasDate
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Group', GroupSchema);
