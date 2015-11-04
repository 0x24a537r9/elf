'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Group = mongoose.model('Group');

/**
 * Globals
 */
var user, group;

/**
 * Unit tests
 */
describe('Group Model Unit Tests:', function () {

  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    });

    user.save(function () {
      group = new Group({
        displayName: 'Group name',
        members: [],  // TODO: Implement
        eventDate: '2015-12-25T00:00:00.000Z',
        owner: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      return group.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when trying to save without group name', function (done) {
      group.displayName = '';

      return group.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Group.remove().exec(function () {
      User.remove().exec(done);
    });
  });
});
