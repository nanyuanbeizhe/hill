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
});