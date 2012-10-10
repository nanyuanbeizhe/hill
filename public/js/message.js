$(function () {
	App = window.App || {};
	App.Model = window.App.Model || {};
	App.Collection = window.App.Collection || {};
	App.View =  window.App.View || {};

	/*
	 * Models
	 */ 
	App.Model.Message = Backbone.Model.extend({
	});

	App.View.Message = Backbone.View.extend({
		templateId: 'tpl-message',

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});

});