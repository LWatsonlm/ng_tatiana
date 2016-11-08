angular
.module("tatiana", [
  "ui.router",
  "ngResource"
])
.config([
  "$stateProvider",
  Router
])
.controller("eventIndexController", [
  "EventFactory",
  "UserFactory",
  eventIndexControllerFunction
])
.controller("EventNewController", [
  "EventFactory",
  "$state",
  eventNewControllerFunction
])
.controller("EventShowController", [
  "EventFactory",
  "$stateParams",
  "UserFactory",
  "$state",
  EventShowControllerFunction
])
.controller("EventUpdateController", [
  "$stateParams",
  "EventFactory",
  "$state",
  EventUpdateControllerFunction
])
.controller("EventWelcomeController", [
  "EventFactory",
  "UserFactory",
  EventWelcomeControllerFunction
])
.controller("UserCreateController", [
  "UserFactory",
  "$state",
  UserCreateControllerFunction
])
.controller("userShowController", [
  "EventFactory",
  "$stateParams",
  "UserFactory",
  "$state",
  userShowControllerFunction
])
.factory("EventFactory", [
  "$resource",
  EventFactoryFunction
])
// .factory("EventCodeFactory", [
//   "$resource",
//   EventCodeFactoryFunction
// ])
.factory("UserFactory", [
  "$resource",
  UserFactoryFunction
])
.factory("AttendanceFactory", [
  "$resource",
  AttendanceFactoryFunction
])
.controller("EventCheckinController", [
  "EventFactory",
  "$state",
  "UserFactory",
  EventCheckinControllerFunction
])
.controller("AttendanceCreateController", [
  "$stateParams",
  "AttendanceFactory",
  "$state",
  AttendanceCreateControllerFunction
])

// Routing
function Router($stateProvider){
  $stateProvider
  .state("eventIndex", {
    url: "/events",
    templateUrl: "js/ng-views/index.html",
    controller: "eventIndexController",
    controllerAs: "vm"
  })
  .state("eventNew", {
    url: "/events/new",
    templateUrl: "js/ng-views/new.html",
    controller: "EventNewController",
    controllerAs: "vm"
  })
  .state("eventShow", {
    url: "/events/:id",
    templateUrl: "js/ng-views/show.html",
    controller: "EventShowController",
    controllerAs: "vm"
  })
  .state("eventUpdate", {
    url: "events/:id/update",
    templateUrl: "js/ng-views/update.html",
    controller: "EventUpdateController",
    controllerAs: "vm"
  })
  .state("eventWelcome", {
    url: "/",
    templateUrl: "js/ng-views/welcome.html",
    controller: "EventWelcomeController",
    controllerAs: "vm"
  })
  .state("eventCheckin", {
    url: "/check-in",
    templateUrl: "js/ng-views/check-in.html",
    controller: "EventCheckinController",
    controllerAs: "vm"
  })
  .state("userCreate", {
    url: '/users',
    templateUrl: 'js/ng-views/new_user.html',
    controller: 'UserCreateController',
    controllerAs: 'vm'
  })
  .state("userShow", {
    url: '/events/:id/users',
    templateUrl: 'js/ng-views/userShow.html',
    controller: 'userShowController',
    controllerAs: 'vm'
  })
  .state("attendanceCreate", {
    url: '/attendances/checkin/:user/:event',
    templateUrl: 'js/ng-views/attendanceCreate.html',
    controller: 'AttendanceCreateController',
    controllerAs: 'vm',
    params: {
      obj: null
    }
  })
}

function AttendanceFactoryFunction($resource) {
  return $resource("http://localhost:3000/attendances/checkin/:user/:event",
  {
    user: '@user',
    event: '@event'
  }, {
    checkin: { method: "POST" }
  })
}

function EventFactoryFunction($resource) {
  return $resource("http://localhost:3000/events/:id", {}, {
      update: {
        method: "put"
      },
      checkin: {
        method: "get"
      }
  })
}

//
// function EventCodeFactoryFunction($resource) {
//   return $resource("http://localhost:3000/decode/:id", {id: '@id'}, {
//     decode: {
//       method: "get"
//     }
//   })
// }

function UserFactoryFunction($resource) {
  return $resource("http://localhost:3000/users/:id", {}, {
    create: { method: "POST" }
  })
}

function eventIndexControllerFunction(EventFactory, UserFactory){
  this.events = EventFactory.query()
}

function EventShowControllerFunction(EventFactory, $stateParams, UserFactory, $state) {
  this.whole = EventFactory.get({id: $stateParams.id}, function(response){
    this.title = response.event.title
    this.attendances = response.event.attendances
  })
  this.update = function(){
    $state.go('eventUpdate', {id: $stateParams.id})
  }
  this.destroy = function(){
    this.whole.$delete({id: $stateParams.id})
    $state.go("eventWelcome")
  }
  this.event = function(){
    $state.go('userShow', {id: $stateParams.id})
  }
}




function EventWelcomeControllerFunction(EventFactory, UserFactory) {
  console.log("welcome");
}

function EventCheckinControllerFunction(EventFactory, $state, UserFactory) {
  const self = this
  this.check = function(){
    console.log(self.event.code);
    EventFactory.get({event:self.event.code}, function(response){
      console.log(response);
      // response.forEach(function(e){
      //   if(e.code == self.event.code){
      //     self.event.id = e.id

          UserFactory.query(function(response){
            response.forEach(function(u){
              if(u.name == self.users.code){
                self.users.id = u.id
                var object = {
                  user: self.users.id,
                  event: self.event.id
                }
                $state.go('attendanceCreate', {event: )
              }
            })
          })
        })
    //   })
    // })
  }
}
function AttendanceCreateControllerFunction($stateParams, AttendanceFactory, $state){
  Attendance = new AttendanceFactory({user_id: $stateParams.obj.user_id, event_id: $stateParams.obj.event_id})
  Attendance.$save().then(attendance => {
    console.log(attendance);
    console.log($stateParams.obj.event_id);
    $state.go('userShow', {id: $stateParams.obj.event_id})
  })
}
// user = UserFactory.get({id: self.users.id})
// event = EventFactory.get({id: self.event.id}, function(response){
//   console.log(response);
// console.log(self.event.id);
// })


function eventNewControllerFunction(EventFactory, $state) {
  this.create = function(){
    Event = new EventFactory(this.event)
    Event.$save().then(event => {
      console.log(event);
      $state.go('eventShow', {id: event.id})
    })
  }
}

function EventUpdateControllerFunction($stateParams, EventFactory, $state){
  const self = this
  //sets placeholder values
  this.event = EventFactory.get({id: $stateParams.id}, function(response){
    self.event = response.event
  })
  //updates after second click
  this.update = function(){
    EventFactory.update({id: $stateParams.id}, self.event).$promise.then(function(response){
      self.event = response.event
      $state.go("eventShow", {id: $stateParams.id})
    })
  }
}

function UserCreateControllerFunction(UserFactory, $state){
  this.hand = function(){
    User = new UserFactory(this.user)
    User.$save().then(user => {
      console.log(user);
      $state.go('eventWelcome')
    })
  }
}
function userShowControllerFunction(EventFactory, $stateParams, UserFactory, $state){
  this.whole = EventFactory.get({id: $stateParams.id}, function(response){
    this.title = response.event.title
    this.attendances = response.event.attendances
  })
  this.event = function(){
    $state.go("eventShow", {id: $stateParams.id})
  }
  this.home = function(){
    $state.go("eventWelcome")
  }
}
// function userCreate(UserFactory){
//   console.log("HIII");
//   // create users
//
//   let user = window.data
//   console.log(user);
//
//   function createUser(user) {
//     UserFactory.create({
//       name: user.firstName
//     }).$promise.then( () => {
//       console.log(window.data);
//     })
//   }
//
// }

// function onLinkedInLoad() {
//   IN.Event.on(IN, "auth", function(){
//     IN.API.Raw("/people/~:(id,firstName,lastName,emailAddress,summary,picture-urls::(original),headline)?format=json").result(onSuccess).error(onError);
//     function onSuccess(data, UserFactory) {
//       console.log(data);
//     }
//     function onError(error) {
//       console.log(error);
//     }
//   })
// }
