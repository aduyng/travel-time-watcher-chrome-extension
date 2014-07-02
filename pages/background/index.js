/*global _, google, chrome */
define(function (require) {
    var Super = require('views/page'),
        Preference = require('models/preference'),
        Promise = require('bluebird');

    var Page = Super.extend({});

    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);

        //listening to changes on user's preferences
        this.listenToUserPreferenceChanges();

    };

    Page.prototype.listenToUserPreferenceChanges = function(){
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            //Preference model is the only model and its id is preference
            if( namespace == 'sync' && changes['Preference-preference'] ){
                this.startWatching();
            }
        }.bind(this));
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
        if( this.intervalHandler ){
            clearInterval(this.intervalHandler);
        }

        var watch = function () {
            //read the preference from sync first
            var preference = new Preference();
            return Promise.resolve(preference.fetch())
                .then(function () {
                    var home = preference.get('homeAddress');
                    var work = preference.get('workAddress');
                    var start = preference.get('workingHoursStart') || 480;
                    var end = preference.get('workingHoursEnd') || 1020;
                    var options = preference.pick('avoidTolls', 'avoidHighways');

                    var now = moment();
                    var nowInMins = now.hours() * 60 + now.minutes();

                    if (home && work) {
                        if (nowInMins > (start + end) / 2) { //pass the mid of the day
                            this.requestForDirection(work, home, options);
                            return;
                        }

                        this.requestForDirection(home, work, options);
                    }
                }.bind(this));
        }.bind(this);
        watch();
        this.intervalHandler = setInterval(watch, 15 * 60 * 1000); //15 mins

    };

    Page.prototype.requestForDirection = function (origin, destination, options) {
        var check = function () {
            console.log('checking for direction ' + origin + ' AND ' + destination);
            return new Promise(function (resolve, reject) {
                var request = _.extend({
                    origin: origin,
                    destination: destination,
                    travelMode: google.maps.TravelMode.DRIVING,
                    avoidTolls: false,
                    avoidHighways: false
                }, options);
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
                        chrome.browserAction.setTitle({
                            title: shortestRoute.get('summary')
                        });

                        chrome.browserAction.setBadgeText({
                            text: shortestRoute.get('legs')[0].duration.text
                        });

//                        console.log(request, shortestRoute.toJSON());
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