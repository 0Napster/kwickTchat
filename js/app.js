var app = angular.module('KwickApp', ['ngStorage']);
app.controller('kwickCtrl', ['$http', '$localStorage', function ($http, $localStorage) {

    this.signUp = function (username, password) {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/signup/' + username + '/' + password + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            if (response.result.status == "done") {
                $localStorage.kwickToken = response.result.token;
                $localStorage.kwickId = response.result.id;
                window.location = "/tchat.html";
            }
        }).error(function (response) {

        });
    };

    this.signIn = function (username, password) {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/login/' + username + '/' + password + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            if (response.result.status == "done") {
                $localStorage.kwickToken = response.result.token;
                $localStorage.kwickId = response.result.id;
                window.location = "/tchat.html";
            }
        }).error(function (response) {

        });
    };
    this.logOut = function () {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/logout/' + $localStorage.kwickToken + '/' + $localStorage.kwickId + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            if (response.result.status == "done") {
                $localStorage.$reset();
                window.location = "index.html";
            }
        }).error(function (response) {
            console.log("erreur vous n'etes pas déconnecté !")
        });
    };
}]);

app.controller('kwickTchatCtrl', ['$http', '$localStorage', function ($http, $localStorage) {
    this.UsersConnected = function () {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/user/logged/' + $localStorage.kwickToken + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            var getUsers = response.result.user;
            var listUsers = [];
            for (var i = 0; i < getUsers.length; i++) {
                listUsers.push('<li><a>' + getUsers[i] + '</a></li>');
            }
            $('.sidebar-nav').append(listUsers);
        }).error(function (response) {
        });
    };
    this.UsersConnected();
}]);

app.controller('kwickSendMessagesCtrl', ['$http', '$localStorage', function ($http, $localStorage) {
    this.sayMessages = function (message) {
        var messageURI = encodeURI(message);
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/say/' + $localStorage.kwickToken + '/' + $localStorage.kwickId + '/' + messageURI + '?callback=JSON_CALLBACK'
        }).success(function (response) {
        }).error(function (response) {
        });
    };
}]);

app.controller('kwickListMessagesCtrl', ['$http', '$localStorage', '$interval', function ($http, $localStorage, $interval) {
    var that = this;
    var lastMessage = new Date().getTime();
    function timeConverter(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }

    this.listMessages = function () {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/talk/list/' + $localStorage.kwickToken + '/' + 0 + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            var table = response.result.talk;
            for (var i = 0; i < table.length; i++) {
                $('.all-messages').append('<h2>' +
                    '<span class="glyphicon glyphicon-user" aria-hidden="true" style="padding-right: 10px;"></span>'
                    + table[i].user_name +
                    '</h2>'
                    + ' dit : '
                    + '<p>'
                    + table[i].content
                    + '</p>'
                    + ' le : '
                    + timeConverter(table[i].timestamp));
            }
            $('.all-messages').animate({scrollTop: $('.all-messages p:last-of-type').offset().top}, 600);
        }).error(function (response) {
        });
    };
    this.listMessages();

    this.refreshMessages = function () {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/talk/list/' + $localStorage.kwickToken + '/' + lastMessage + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            var table = response.result.talk;
            for (var i = 0; i < table.length; i++) {
                $('.all-messages').append('<h2>' +
                    '<span class="glyphicon glyphicon-user" aria-hidden="true" style="padding-right: 10px;"></span>'
                    + table[i].user_name +
                    '</h2>'
                    + ' dit : '
                    + '<p>'
                    + table[i].content
                    + '</p>'
                    + ' le : '
                    + timeConverter(table[i].timestamp));
            }
            //$('.all-messages').animate({scrollTop: $('.all-messages p:last-of-type').offset().top}, 600);
        }).error(function (response) {
        });
    };
    setInterval(function() {
        console.log(lastMessage);
        that.refreshMessages(lastMessage);
    }, 5000);
    //$interval(that.refreshMessages(), 5000);
}]);


