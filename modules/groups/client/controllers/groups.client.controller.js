'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Groups',
  function ($scope, $stateParams, $location, Authentication, Groups) {
    $scope.authentication = Authentication;

    // Create new Group
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'groupForm');

        return false;
      }

      // Create new Group object
      var group = new Groups({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      group.$save(function (response) {
        $location.path('groups/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
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

        return false;
      }

      var group = $scope.group;

      group.$update(function () {
        $location.path('groups/' + group._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Groups
    $scope.find = function () {
      $scope.groups = Groups.query();
    };

    // Find existing Group
    $scope.findOne = function () {
      $scope.group = Groups.get({
        groupId: $stateParams.groupId
      });
    };
  }
]);
