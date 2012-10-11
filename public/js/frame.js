$(function () {
	App = window.App || {};
	App.View =  window.App.View || {};

	App.View.Frame = Backbone.View.extend({
		initialize: function() {
			this.template = _.template(loadTemplate(this.options.templateId));
		},

		render: function() {
			$(this.el).html(this.template());
			return this;		
		}
	});

	App.View.Notice = Backbone.View.extend({
		templateId : 'tpl-notice-head',
		events: {
			"click button":   "closeNotice"
		},

		closeNotice: function() {
			$.cookie('never_notice', $('#never-show').val());
		},

		render: function() {
			if($.cookie('never_notice')) return this;
			
			this.template = _.template(loadTemplate(this.templateId));
			$(this.el).html(this.template());
			return this;
		}
	});
});