'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Group = mongoose.model('Group'),
  Member = mongoose.model('Member'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a group
 */
exports.create = function (req, res) {
  var group = new Group(req.body);
  group.owner = req.user;

  group.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(group);
  });
};

/**
 * Show the current group
 */
exports.read = function (req, res) {
  res.json(req.group);
};

/**
 * Update a group
 */
exports.update = function (req, res) {
  var group = req.group;

  group.displayName = req.body.displayName;
  group.eventDate = req.body.eventDate;
  
  group.members = [];
  for (var i = 0; i < req.body.members.length; ++i) {
    var member = new Member(req.body.members[i]);
    if (!member.validateSync()) {
      group.members.push(member);
    }
  }

  group.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    if (req.query.sendEmails) {
      console.info('Sending emails...');
      // TODO: queue emails and set hasSentEmails to true.
    }
    res.json(group);
  });
};

/**
 * Delete a group
 */
exports.delete = function (req, res) {
  var group = req.group;

  group.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(group);
  });
};

/**
 * List of Groups
 */
exports.list = function (req, res) {
  Group.find({ 'owner._id': req.user._id }).sort('-created').populate('owner', 'displayName').exec(function (err, groups) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(groups);
  });
};

/**
 * Group middleware
 */
exports.groupById = function (req, res, next, id) {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return res.status(400).send({
      message: 'Group is invalid'
    });
  }

  Group.findById(id).populate('owner', 'displayName').exec(function (err, group) {
    if (err) {
      return next(err);
    } else if (!group) {
      return res.status(404).send({
        message: 'No group with that identifier has been found'
      });
    }
    req.group = group;
    next();
  });
};
