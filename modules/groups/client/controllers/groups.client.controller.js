'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups',
  function ($scope, $stateParams, $location, Authentication, Groups) {
    $scope.authentication = Authentication;
    $scope.nextChristmasYear = new Date(new Date().valueOf() + 864e5 * 7).getFullYear();
    $scope.year = new Date().getFullYear();
    $scope.month = 12;
    $scope.day = 25;

    /**
     * Generates a random 64-bit ID and encodes it in URL-safe base64. Must be kept in sync with the
     * similarly-named function in group.server.model.js.
     */
    function generateRandomId() {
      var id = '';
      var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
      for (var i = 0; i < 11; ++i) {
        id += chars[Math.floor(Math.random() * 64)];
      }
      return id;
    }
    
    // Create new Group
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'groupForm');

        return false;
      }

      // Create new Group object
      var group = new Groups({
        displayName: this.displayName,
        eventDate: this.year + '-' + this.month + '-' + this.day,
        members: [{
          _id: generateRandomId(),
          displayName: Authentication.user.displayName,
          email: Authentication.user.email
        }]
      });

      // Redirect after save
      group.$save(function (response) {
        $location.path('groups/' + response._id + '/edit');

        // Clear form fields
        $scope.displayName = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Create new Group member
    $scope.createMember = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'memberForm');

        return false;
      }

      var group = $scope.group;
      group.$saveMember(function () {
        $location.path('groups/' + group._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Group
    $scope.remove = function (group) {
      if (group) {
        group.$remove();

        for (var i in $scope.groups) {
          if ($scope.groups[i] === group) {
            $scope.groups.splice(i, 1);
          }
        }
      } else {
        $scope.group.$remove(function () {
          $location.path('groups');
        });
      }
    };

    // Update existing Group
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'groupForm');
        $scope.$broadcast('show-errors-check-validity', 'memberForm');

        return false;
      }

      var group = $scope.group;
      group.eventDate = this.year + '-' + this.month + '-' + this.day;

      group.$update(function () {
        $location.path('groups/' + group._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Update existing Group and send emails
    $scope.updateAndSendEmails = function () {
      $scope.error = null;
      var group = $scope.group;

      group.$updateAndSendEmails(function () {
        $location.path('groups/' + group._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Groups
    $scope.find = function () {
      $scope.groups = Groups.query();
    };

    // Find an existing Group
    $scope.findOne = function (autoAddBlankMember) {
      $scope.group = Groups.get({
        groupId: $stateParams.groupId
      }, function() {
        var eventDate = new Date($scope.group.eventDate);
        $scope.year = eventDate.getFullYear();
        $scope.month = eventDate.getMonth() + 1;
        $scope.day = eventDate.getDate();
        if (autoAddBlankMember) {
          $scope.maybeAddBlankMember();
        }
      });
    };

    // Find an existing Group as a gest
    $scope.findOneAsGuest = function () {
      $scope.group = Groups.getAsGuest({
        groupId: $stateParams.groupId
      }, function() {
        var eventDate = new Date($scope.group.eventDate);
        $scope.year = eventDate.getFullYear();
        $scope.month = eventDate.getMonth() + 1;
        $scope.day = eventDate.getDate();
        $scope.maybeAddBlankMember();
      });
    };

    // Find one member of the group by their id
    $scope.findOneMember = function (id) {
      var members = $scope.group.members;
      for (var i = 0; i < members.length; ++i) {
        if (members[i]._id === id) {
          return members[i];
        }
      }
    };

    // Remove one member of the group by their index
    $scope.removeMember = function (i) {
      $scope.group.members.splice(i, 1);
    };

    // Ensure there's always a blank member at the end of the members list
    $scope.maybeAddBlankMember = function () {
      var members = $scope.group.members;
      if (members.length <= 0 ||
          members[members.length - 1].displayName ||
          members[members.length - 1].email) {
        members.push({
          _id: generateRandomId(),
          displayName: '',
          email: ''
        });
      }
    };

    // Randomize the assignments of members
    $scope.randomizeAssignments = function () {
      var members = $scope.group.members.slice();
      
      // Shuffle the members (using Knuth's algorithm)
      for (var i = members.length - 1; i > 0; --i) {
        var randomIndex = Math.floor(Math.random() * i + 1);
        var swap = members[i];
        members[i] = members[randomIndex];
        members[randomIndex] = swap;
      }

      // Assign the members in order as a single large cycle
      var lastMember = members[members.length - 1];
      for (i = 0; i < members.length; ++i) {
        members[i].has = lastMember._id;
        lastMember = members[i];
      }
    };
  }
]);
