$(function () {
	App = window.App || {};
	App.Model = window.App.Model || {};
	App.Collection = window.App.Collection || {};
	App.View =  window.App.View || {};

	/*
	 * Models
	 */ 
	App.Model.Session = Backbone.Model.extend({
		urlRoot: '/sessions',
		auth: false				// default
	});

	/**
	 * Collection
	 */

	/**
	 * Views
	 */
	App.View.Login = Backbone.View.extend({
		templateId: 'tpl-session-login',
		events: {
			"click #btnLogin" 	: 		"login",
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			$(this.el).html(this.template());
			return this;
		},

		login: function() {
			var that = this;
			var creds = $('#loginForm').serializeObject();
			that.model.set('userCookie', false);
			that.model.save(creds, {
				success: function(model, resp) {
					that.model = model;
					App.router.navigate('', true);
				},
				error: function(model, resp){
					var message = resp.getResponseHeader('message');
					console.log(message);
					$('#loginForm').popover({placement: 'right', title: resp.status, content: message});
					$('#loginForm').popover('show');
				}
			});

			return false;
		}
	});

});