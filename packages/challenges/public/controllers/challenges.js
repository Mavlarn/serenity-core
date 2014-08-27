/**
 * Copyright (c) 2014 TopCoder, Inc. All rights reserved.
 */
'use strict';

angular.module('mean.challenges').controller('ChallengesController', ['$scope', '$stateParams', '$location', '$sce', 'Global', 'Challenges',
  function($scope, $stateParams, $location, $sce, Global, Challenges) {
    $scope.global = Global;

    $scope.checkNew = function() {
      if ($stateParams.challengeId) {
        $scope.findOne();
      } else {
        var challenge = new Challenges({
          title: 'Untitled Challenge',
          type: 'Architecture'
        });

        challenge.$save(function(response) {
          Challenges.newChallengeId = response.id;
          $location.path('challenges/' + response.id + '/edit');
        });
      }
    };

    $scope.cancelChallenge = function(challenge) {
      if (Challenges.newChallengeId!==undefined && challenge.id === Challenges.newChallengeId) {
        challenge.$remove(null,function(){
          $scope.newChallengeId = null;
          $location.path('challenges');
        });
      }else{
          $location.path('challenges');
      }
    };

    $scope.create = function(isValid) {
      if (isValid) {
        var challenge = new Challenges({
          title: this.title,
          regStartDate: this.regStartDate,
          subEndDate: this.subEndDate,
          summary: this.overview,
          description: this.description,
          registeredDescription: this.registeredDescription,
          type: this.type
        });

        if (this.tagList) {
          challenge.tags = [];
          var tags = this.tagList.split(',');
          for (var i = 0; i < tags.length; i += 1) {
            challenge.tags.push(tags[i].trim());
          }
        }

        challenge.$save(function(response) {
          $location.path('challenges/' + response.id);
        });

        this.title = '';
        this.regStartDate = '';
        this.subEndDate = '';
        this.overview = '';
        this.description = '';
        this.registeredDescription = '';
        this.type = 'Architecture';
      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(challenge) {
      if (challenge) {
        challenge.$remove();

        for (var i in $scope.challenges) {
          if ($scope.challenges[i] === challenge) {
            $scope.challenges.splice(i, 1);
          }
        }
      } else {
        $scope.challenge.$remove(function(response) {
          $location.path('challenges');
        });
      }
    };

    $scope.update = function(isValid, challengeForm) {
      Challenges.newChallengeId = null;
      if (isValid) {
        var challenge = $scope.challenge;
        challenge.title = challenge.title.trim();

        if (challenge.tagList) {
          challenge.tags = [];
          var tags = challenge.tagList.split(',');
          for (var i = 0; i < tags.length; i += 1) {
            challenge.tags.push(tags[i].trim());
          }
        }

        challenge.$update(function() {
          $location.path('challenges/' + challenge.id);
        }, function(){
          challengeForm.title.$error.required = true;
          challengeForm.title.$invalid = true;
          $scope.submitted = true;
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.gridOptions = {};
    $scope.find = function() {
      Challenges.query(function(challenges) {
        $scope.challenges = challenges;

        $scope.challengesGrid = [];
        challenges.forEach(function(challenge) {
          $scope.challengesGrid.push({Edit: '', Title: challenge.title, Creator: 'creator', Created: challenge.createdAt});
        });

      });

      $scope.challengeColumnDefs = [
            {displayName: 'Edit', cellTemplate: '<a class="btn" href="/#!/challenges/{{row.entity.id}}/edit"><span class="glyphicon glyphicon-edit"></span></a>'},
            {field: 'title', displayName: 'Title', cellTemplate: '<a class="btn" href="/#!/challenges/{{row.entity.id}}">{{row.entity.title}}</a>'},
            {field: 'creator', displayName: 'Creator'},
            {field: 'createdAt', displayName: 'Created', cellTemplate: '<span>{{row.entity.createdAt| date: \'yyyy/MM/dd HH:mm a\'}}</span>'}
          ];

    };


    $scope.findOne = function() {
      Challenges.get({
        challengeId: $stateParams.challengeId
      }, function(challenge) {
        window.ch = challenge;

        if (challenge.tags) {
          challenge.tagList = challenge.tags.join(',');
        }

        $scope.challenge = challenge;
      });
    };

    $scope.renderHtml = function(html) {
      return $sce.trustAsHtml(html);
    };

    $scope.selectItem = function(selectedItem) {
      angular.forEach($scope.challenges, function(item) {
        item.selected = false;
        if (selectedItem === item) {
          $scope.selected = item;
          selectedItem.selected = true;
        }
      });
    };
  }
]);
