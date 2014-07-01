define(function(require) {
    var Super = require('./base');

    var Model = Super.extend({
        chromeStorage: new Backbone.ChromeStorage("Preference", "sync"),
        defaults:{
            id: 'preference',
            workingHoursStart: 480,
            workingHoursEnd: 1020
        }
    });

    return Model;
});