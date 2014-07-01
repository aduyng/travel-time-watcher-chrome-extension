/*global requirejs*/

requirejs.config({
    baseUrl: './',
    paths: {
        underscore: 'vendors/underscore/underscore',
        backbone: 'vendors/backbone/backbone',
        'backbone.chromestorage': 'vendors/backbone/backbone.chromestorage',
        bootstrap: 'vendors/bootstrap/dist/js/bootstrap',
        'bootstrap-switch': 'vendors/bootstrap-switch/build/js/bootstrap-switch',
        text: 'vendors/requirejs-text/text',
        hbs: 'vendors/require-handlebars-plugin/hbs',
        i18nprecompile: 'vendors/require-handlebars-plugin/hbs/i18nprecompile',
        json2: 'vendors/require-handlebars-plugin/hbs/json2',
        goog: 'vendors/requirejs-plugins/src/goog',
        async: 'vendors/requirejs-plugins/src/async',
        propertyParser: 'vendors/requirejs-plugins/src/propertyParser',
        jquery: 'vendors/jquery/dist/jquery',
        'jqBootstrapValidation': 'vendors/jqBootstrapValidation/src/jqBootstrapValidation',
        'bootstrap-touchspin': 'vendors/bootstrap-touchspin/bootstrap-touchspin/bootstrap.touchspin',
        toastr: 'vendors/toastr/toastr',
        ladda: 'vendors/ladda/js/ladda',
        spin: 'vendors/ladda/js/spin',
        moment: 'vendors/moment/moment',
        nprogress: 'vendors/nprogress/nprogress',
        'underscore.string': 'vendors/underscore.string/underscore.string',
        accounting: 'vendors/accounting/accounting',
        bluebird: 'vendors/bluebird/js/browser/bluebird'
    },
    hbs: {
        helpers: true,
        i18n: true,
        templateExtension: 'hbs',
        partialsUrl: '',
        disableI18n: false
    },
    shim: {
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'backbone.chromestorage':{
            deps: ['backbone']
        },
        toastr: {
            deps: ['jquery']
        },
        nprogress: {
            deps: ['jquery']
        },
        bootstrapConfirmButton: {
            deps: ["jquery", "bootstrap"]
        },
        'bootstrap-touchspin': {
            deps: ["jquery", "bootstrap"]
        },
        bootstrap: {
            deps: ["jquery"]
        },
        ladda: {
            deps: ["spin"]
        },
        'jquery.cookie': {
            deps: ['jquery']
        },
        'jqBootstrapValidation': {
            deps: ['jquery']
        },
        'bootstrap-switch': {
            deps: ['jquery']

        },
        router: {
            depts: [
                'nprogress'
            ]
        },
        app: {
            deps: [
                'jquery',
                'underscore',
                'backbone',
                'bootstrap',
                'toastr',
                'accounting',
                'moment',
                'nprogress'
            ]
        }
    }
});
if (!Function.prototype.bind) {
    Function.prototype.bind = function (bind) {
        var self = this;
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return self.apply(bind || null, args);
        };
    };
}

require([
        'jquery',
        'jqBootstrapValidation',
        'bootstrap-touchspin',
        'spin',
        'ladda',
        'moment',
        'underscore',
        'underscore.string',
        'backbone',
        'backbone.chromestorage',
        'bootstrap',
        'toastr',
        'accounting',
        'moment',
        'nprogress',
        'bootstrap-switch',
        'hbs/handlebars'],
    function ($, jqBootstrapValidation, bootstrapTouchspin, Spin, Ladda, moment, _, _s, Backbone, BackboneChromeStorage, Bootstrap, Toastr, Accounting, Moment, NProgress, BootstrapSwitch, Handlebars) {
        //region add current time and version to the request
        Backbone.ajax = function () {
            var args = arguments;
            if (!args[0]) {
                args[0] = {};
            }
            if (!args[0].headers) {
                args[0].headers = {};
            }
            _.extend(args[0].headers, {'X-Version': window.config.version, 'X-Now': moment().unix()});
            var oldError = args[0].error;
            args[0].error = function (jqXHR, textStatus, errorThrown) {
                if (oldError) {
                    oldError(jqXHR, textStatus, errorThrown)
                }

                //reload because there is a new version
                if (jqXHR.status == 426) {
                    window.location.reload();
                }

            };

            return Backbone.$.ajax.apply(Backbone.$, args);
        };

        if (!window._s) {
            window._s = _s;
        }
        if (!window.Ladda) {
            window.Ladda = Ladda;
        }


        require(['app'], function (Application) {

            window.app = new Application({
            });
            window.app.run();
        });
    });