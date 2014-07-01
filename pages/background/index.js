/*global _, google*/
define(function (require) {
    var Super = require('views/page'),
        Preference = require('models/preference'),
        Promise = require('bluebird');

    var Page = Super.extend({});

    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
    };

    Page.prototype.render = function () {
        return new Promise(function (resolve, reject) {
            require(['async!https://maps.google.com/maps/api/js?sensor=false&key=' + window.app.config.get('googleMapApiKey')], function (GMapDummy) {
                resolve();
            });
        })
            .then(function () {
                this.startWatching();
                this.ready();
            }.bind(this));
    };

    Page.prototype.startWatching = function () {
        var watch = function () {
            //read the preference from sync first
            var preference = new Preference();
            return Promise.resolve(preference.fetch())
                .then(function () {
                    var home = preference.get('homeAddress');
                    var work = preference.get('workAddress');
                    var start = preference.get('workingHoursStart') || 480;
                    var end = preference.get('workingHoursEnd') || 1020;
                    var now = moment();
                    var nowInMins = now.hours() * 60 + now.minutes();

                    if (home && work) {
                        if (nowInMins > (start + end) / 2) { //pass the mid of the day
                            this.requestForDirection(work, home);
                            return;
                        }

                        this.requestForDirection(home, work);
                    }
                }.bind(this));
        }.bind(this);
        watch();
        setInterval(watch, 15 * 60 * 1000); //15 mins

    };

    Page.prototype.requestForDirection = function (origin, destination) {
        var check = function () {
            console.log('checking for direction ' + origin + ' AND ' + destination);
            return new Promise(function (resolve, reject) {
                var request = {
                    origin: origin,
                    destination: destination,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                var directionsService = new google.maps.DirectionsService();

                directionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        var routes = new Backbone.Collection(response.routes);
                        routes.comparator = function (model) {
                            return model.get('legs')[0].duration.value;
                        };

                        routes.sort();
                        var shortestRoute = routes.at(0);

                        //set the badge using text return by google map
                        chrome.browserAction.setBadgeText({
                            text: shortestRoute.get('legs')[0].duration.text
                        });

                        return resolve();
                    }
                    reject();
                });
            });
        };
        return check();
    };

    return Page;


});