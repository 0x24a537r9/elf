'use strict';

//Groups service used for communicating with the groups REST endpoints
angular.module('groups').factory('Groups', ['$resource',
  function ($resource) {
    return $resource('api/groups/:groupId', {
      groupId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
