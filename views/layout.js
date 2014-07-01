define(function (require) {
    var Super = require('views/base'),
        Template = require("hbs!views/layout.tpl");

    var Layout = Super.extend({
        el: 'body'
    });

    Layout.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);

        if (!options.app) {
            throw new Error("app must be passed!");
        }

        this.app = options.app;
    };

    Layout.prototype.render = function () {

        this.$el.html(Template({
            id: this.id
        }));
        this.mapControls();

        this.trigger('drew', this);

    };

    return Layout;
});