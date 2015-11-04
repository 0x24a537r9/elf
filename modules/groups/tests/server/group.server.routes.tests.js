'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Group = mongoose.model('Group'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, otherUser, group;

/**
 * Group routes tests
 */
describe('Group CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    otherUser = new User({
      firstName: 'Other',
      lastName: 'Name',
      displayName: 'Other Name',
      email: 'othertest@test.com',
      username: 'other_username',
      password: 'M3@n.jsI$Aw3$0m3',
      provider: 'local'
    });

    // Save users to the test db and create new group
    user.save(function () {
      otherUser.save(function () {
        group = {
          displayName: 'Group name',
          members: [],  // TODO: Implement
          eventDate: '2015-12-25T00:00:00.000Z',
          owner: user
        };

        done();
      });
    });
  });

  it('should be able to create a group if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle group save error
            if (groupSaveErr) {
              return done(groupSaveErr);
            }

            // Get the group
            agent.get('/api/groups/' + groupSaveRes.body._id)
              .end(function (groupsGetErr, groupsGetRes) {
                // Handle group save error
                if (groupsGetErr) {
                  return done(groupsGetErr);
                }

                // Get group
                var group = groupsGetRes.body;

                // Set assertions
                (group.owner._id).should.equal(user.id);
                (group.displayName).should.match('Group name');
                (group.eventDate).should.match('2015-12-25T00:00:00.000Z');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to create a group if not signed in', function (done) {
    agent.post('/api/groups')
      .send(group)
      .expect(403)
      .end(function (groupSaveErr, groupSaveRes) {
        // Call the assertion callback
        done(groupSaveErr);
      });
  });

  it('should not be able to create a group if no displayName is provided', function (done) {
    // Invalidate displayName field
    group.displayName = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(400)
          .end(function (groupSaveErr, groupSaveRes) {
            // Set message assertion
            (groupSaveRes.body.message).should.match('Please fill in group name');

            // Handle group save error
            done(groupSaveErr);
          });
      });
  });

  it('should be able to update a group if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle group save error
            if (groupSaveErr) {
              return done(groupSaveErr);
            }

            // Update group displayName
            group.displayName = 'New group name';

            // Update an existing group
            agent.put('/api/groups/' + groupSaveRes.body._id)
              .send(group)
              .expect(200)
              .end(function (groupUpdateErr, groupUpdateRes) {
                // Handle group update error
                if (groupUpdateErr) {
                  return done(groupUpdateErr);
                }

                // Set assertions
                (groupUpdateRes.body._id).should.equal(groupSaveRes.body._id);
                (groupUpdateRes.body.displayName).should.match('New group name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to update another user\'s group even if signed in', function (done) {
    group.owner = otherUser;
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Try to delete another user's existing group
          agent.put('/api/groups/' + groupObj._id)
            .send(group)
            .expect(403)
            .end(function (groupDeleteErr, groupDeleteRes) {
              if (groupDeleteErr) {
                return done(groupDeleteErr);
              }

              // Set message assertion
              (groupDeleteRes.body.message).should.match('User is not authorized');

              done();
            });
        });
    });
  });

  it('should not be able to update a group if not signed in', function (done) {
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      // Update group displayName
      group.displayName = 'New group name';

      request(app).put('/api/groups/' + groupObj._id)
        .expect(403)
        .end(function (groupUpdateErr, groupUpdateRes) {
          // Call the assertion callback
          done(groupUpdateErr);
        });
    });
  });

  it('should not be able to get a list of groups if not signed in', function (done) {
    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      // Request groups
      request(app).get('/api/groups')
        .expect(403)
        .end(function (groupSaveErr, groupSaveRes) {
          // Call the assertion callback
          done(groupSaveErr);
        });
    });
  });

  it('should not be able to get a list of groups even if signed in', function (done) {
    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Request groups
          agent.get('/api/groups')
            .expect(403)
            .end(function (groupSaveErr, groupSaveRes) {
              // Call the assertion callback
              done(groupSaveErr);
            });
        });
    });
  });

  it('should be able to get a single group if not signed in', function (done) {
    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      request(app).get('/api/groups/' + groupObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('displayName', group.displayName);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single group with an invalid Id, if not signed in', function (done) {
    // test is not a valid Group Id
    request(app).get('/api/groups/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Group is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single group which doesnt exist, if not signed in', function (done) {
    // This is a valid Group Id but a non-existent group
    request(app).get('/api/groups/123abcdefgh')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No group with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete a group if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle group save error
            if (groupSaveErr) {
              return done(groupSaveErr);
            }

            // Delete an existing group
            agent.delete('/api/groups/' + groupSaveRes.body._id)
              .expect(200)
              .end(function (groupDeleteErr, groupDeleteRes) {
                // Handle group error error
                if (groupDeleteErr) {
                  return done(groupDeleteErr);
                }

                // Set assertions
                (groupDeleteRes.body._id).should.equal(groupSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete another user\'s group even if signed in', function (done) {
    group.owner = otherUser;
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Try to delete another user's existing group
          agent.delete('/api/groups/' + groupObj._id)
            .expect(403)
            .end(function (groupDeleteErr, groupDeleteRes) {
              if (groupDeleteErr) {
                return done(groupDeleteErr);
              }

              // Set message assertion
              (groupDeleteRes.body.message).should.match('User is not authorized');

              done();
            });
        });
    });
  });

  it('should not be able to delete a group if not signed in', function (done) {
    // Set group user
    group.user = user;

    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      // Try deleting group
      request(app).delete('/api/groups/' + groupObj._id)
        .expect(403)
        .end(function (groupDeleteErr, groupDeleteRes) {
          if (groupDeleteErr) {
            return done(groupDeleteErr);
          }

          // Set message assertion
          (groupDeleteRes.body.message).should.match('User is not authorized');

          done();
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Group.remove().exec(done);
    });
  });
});
