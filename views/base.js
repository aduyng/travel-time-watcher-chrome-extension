/*global _, Backbone, _s*/
define(function (require) {
    var Super = Backbone.View;

    function getGUID() {
        if (!window.guid) {
            window.guid = 0;
        }
        window.guid++;
        return 'uid' + '-' + window.guid;
    }

    var View = Super.extend({
                            });

    View.prototype.initialize = function (options) {
        options = options || {};
        options.id = options.id || getGUID();

        Super.prototype.initialize.call(this, options);
        if (!this.id) {
            this.id = options.id;
        }
        if (!this.options) {
            this.options = options;
        }
        this.controls = {};
        this.children = {};
    };

    View.prototype.mapControls = function () {
        _.forEach(this.$el.find('[id]'), function (element) {
            var e = $(element);
            if (!e.attr('name')) {
                e.attr('name', e.attr('id'));
            }
            this.controls[_s.camelize(e.attr('id').replace(this.id + '-', ''))] = e;
        }, this);
    };

    View.prototype.parseMessages = function () {
        this.i18n = {};
        _.forEach(this.$el.find('.' + this.getId('i18n')), function (element) {
            var e = $(element);
            this.i18n[_s.camelize(e.data('key'))] = e.html();
        }, this);
    };

    View.prototype.serialize = function () {
        var serializedData = {};
        _.forEach(this.$el.find('.' + this.getId('field')), function (element) {
            var e = $(element);
            var val;
            if (e.is('.radio-group')) {
                val = e.find('input[name=' + e.attr('id') + ']:checked').val();
            } else if (e.is('input[type=checkbox]')) {
                val = e.is(':checked');
            } else {
                val = e.val();
            }
            serializedData[_s.camelize(e.attr('id').replace(this.id + '-', ''))] = val;
        }, this);
        return serializedData;
    };

    View.prototype.getId = function (suffix) {
        var id = this.id || this.options.id;
        if (!_.isEmpty(suffix)) {
            id += '-' + suffix;
        }
        return id;
    };

    View.prototype.initValidator = function (options, container) {
        var defaults = {
            errorElement: 'p',
            highlight: function (element, errorClass, validClass) {
                var f = function () {
                    var labels = $(element.form).find("label[for=" + element.id + "]");
                    if (labels[1]) {
                        $(labels[1]).addClass('help-block control-label');
                    }
                };
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
                _.defer(f);
            },
            success: function (element) {
                var f = function () {
                    var labels = $(element.form).find("label[for=" + element.id + "]");
                    if (labels[1]) {
                        $(labels[1]).addClass('help-block control-label');
                    }
                };
                element
                    .html('<i class="icon-ok"></i> OK')
                    .closest('.form-group').removeClass('error').addClass('has-success');
                _.defer(f);

            }
        };
        _.extend(defaults, options || {});
        if (!container) {
            if (this.controls.form) {
                container = this.controls.form;
            }
        }

        if (!container) {
            throw new Error("container must be passed or this.controls.form must be presented!");
        }
        this.validator = container.validate(defaults);
    };

    View.prototype.find = function(selector){
        return this.$el.find(selector);
    };
    
    View.prototype.toId = function(name){
        return '#' + this.getId(name);
    };
    
    View.prototype.toClass = function(name){
        return  '.' + this.getId(name);
    };
    
    View.prototype.findByClass = function(cls){
        return this.find(this.toClass(cls));
    };
    
    View.prototype.findById = function(id){
        return this.find(this.toId(id));
    };
    

    return View;
});