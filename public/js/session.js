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
		emailError: false,
		passwordError: false,

		events: {
			"click #btnLogin" 	 : 		"login",
			"focus #input-email" :      "hideEmailError",
			"focus #input-password" : 	"hidePasswordError"
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
					window.history.back();
				},
				error: function(model, resp){
					that.model.clear({silent:true});
					that.model.set('auth', false);
					var message = resp.getResponseHeader('message');
					if(message.indexOf('password') >= 0){
						passwordError = true;
						$('#input-password').popover({placement: 'right', title: message});
						$('#input-password').popover('show');
					}else{
						emailError = true;
						$('#input-email').popover({placement: 'right', title: message});
						$('#input-email').popover('show');
					}
				}
			});

			return false;
		},

		hideEmailError: function() {
			if(emailError) {
				$('#input-email').popover('destroy');
				emailError = false;
			}
		},

		hidePasswordError: function() {
			if(passwordError) {
				$('#input-password').popover('destroy');
				passwordError = false;
			}
		}
	});

	App.View.LoginBlock = Backbone.View.extend({
		templateId: 'tpl-session-login-small',
		events: {
			"click #btnLogin" 	: 		"login",
			"click #btnLogout" 	: 		"logout"
		},

		initialize: function() {
			var that = this;
			this.template = _.template(loadTemplate(this.templateId));
			this.model.on('change:auth', function(){
				that.render();
			});
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		login: function() {
			var that = this;
			var creds = $('#loginForm').serializeObject();
			that.model.set('userCookie', false);
			that.model.save(creds, {
				success: function(model, resp) {
					that.model = model;
				},
				error: function(model, resp){
					that.model.clear({silent:true});
					that.model.set('auth', false);
					var message = resp.getResponseHeader('message');
					if(message.indexOf('password') >= 0){
						console.log('password error: ' + message);
						$('#input-password').popover({placement: 'right', title: message});
						$('#input-password').popover('show');
					}else{
						console.log('email error' + message);
						$('#input-email').popover({placement: 'right', title: message});
						$('#input-email').popover('show');
					}
				}
			});

			return false;
		},

		logout: function() {
	        var that = this;

	        that.model.destroy({
	            success: function(model, resp) {
	                that.model.clear({silent:true});
	                that.model.set('auth', false);
	            },
	            error: function(model, resp) {
	                console.log('error');
	            }
	        });
		}
	});

});