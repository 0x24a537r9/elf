'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator');

/**
 * Generates a random 64-bit ID and encodes it in URL-safe base64. Must be kept in sync with the
 * similarly-named function in groups.client.controller.js.
 */
function generateRandomId() {
  var id = '';
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  for (var i = 0; i < 11; ++i) {
    id += chars[Math.floor(Math.random() * 64)];
  }
  return id;
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
    trim: true,
    required: 'Please fill in a member name'
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: 'Please fill in an email address',
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
  eventDate: {
    type: Date,
    default: getNextChristmasDate
  },
  members: [MemberSchema],
  isOpen: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Group', GroupSchema);
