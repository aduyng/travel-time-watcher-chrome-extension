/*global _*/
define(function (require) {
    var Super = require('views/page'),
        Promise = require('bluebird'),
        Preference = require('models/preference'),
        Template = require('hbs!./index.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.model = new Preference({
            id: 'preference'
        });
    };

    Page.prototype.render = function () {
        return Promise.resolve(this.model.fetch()).then(function () {
            var start = moment().hours(0).minutes(this.model.get('workingHoursStart'));
            var end = moment().hours(0).minutes(this.model.get('workingHoursEnd'));

            this.$el.html(Template({
                id: this.id,
                data: _.extend(this.model.toJSON(), {
                    workingHoursStart: start.unix(),
                    workingHoursEnd: end.unix()

                })
            }));

            this.mapControls();

            var events = {};
            events['click ' + this.toId('save')] = 'saveClickHandler';
            this.delegateEvents(events);
            this.ready();
        }.bind(this));
    };


    Page.prototype.saveClickHandler = function (event) {
        event.preventDefault();

        //TODO: add the validator here
        var start = moment(this.controls.workingHoursStart.val(), "HH:mm A");
        var end = moment(this.controls.workingHoursEnd.val(), "HH:mm A");


        var data = _.extend(this.serialize(), {workingHoursStart: start.hours() * 60 + start.minutes(), workingHoursEnd: end.hours() * 60 + end.minutes()});


        Promise.resolve(this.model.save(data))
            .then(function () {
                this.toast.success('Options have been saved!');
            }.bind(this));

    };

    return Page;


});