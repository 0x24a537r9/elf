'use strict';

/**
 * Module dependencies.
 */
var groupsPolicy = require('../policies/groups.server.policy'),
  groups = require('../controllers/groups.server.controller');

module.exports = function (app) {
  // Groups collection routes
  app.route('/api/groups').all(groupsPolicy.isAllowed)
    .post(groups.create);

  // Single group routes
  app.route('/api/groups/:groupId').all(groupsPolicy.isAllowed)
    .get(groups.read)
    .put(groups.update)
    .delete(groups.delete);

  app.route('/api/groups/:groupId/members').all(groupsPolicy.isAllowed)
    .get(groups.readAsGuest)
    .post(groups.createMember);

  // Finish by binding the group middleware
  app.param('groupId', groups.groupById);
};
