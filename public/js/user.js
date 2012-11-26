$(function () {
	App = window.App || {};
	App.Model = window.App.Model || {};
	App.Collection = window.App.Collection || {};
	App.View =  window.App.View || {};

	/*
	 * Models
	 */ 
	App.Model.User = Backbone.Model.extend({
		idAttribute: "_id",
		urlRoot: '/users'
	});

	/**
	 * Collection
	 */
	App.Collection.UserCollection = Backbone.Collection.extend({
		model: App.Model.User,
		url: '/users'
	});

	/**
	 * Views
	 */
	App.View.ProfileEditor = Backbone.View.extend({
		templateId : 'tpl-profile-edit',

		events: {
			"click #btnSave" 	: 		"save"
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},		

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		save: function() {
			var that = this;
			var creds = $('#profile-editor').serializeObject();
			that.model.save(creds, {
				success: function(model, resp) {
					that.model = model;
					$('#profile-editor-message').html('修改成功');
				}
			});
			return false;
		}
	});

	App.View.PasswordEditor = Backbone.View.extend({
		templateId : 'tpl-password-edit',

		events: {
			"click #btnSave" 	: 		"save"
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},		

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		save: function() {
			var that = this;
			var creds = $('#password-editor').serializeObject();
			that.model.save(creds, {
				success: function(model, resp) {
					that.model = model;
					$('#password-editor-message').html('修改成功');
				}
			});
			return false;
		}
	});

	App.View.PasswordResetor = Backbone.View.extend({
		templateId : 'tpl-password-reset',

		events: {
			"click #btnSave" 	: 		"save"
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},		

		render: function() {
			$(this.el).html(this.template());
			return this;
		},

		save: function() {
			$('#btnSave').html('Sending email...');
			$('#btnSave').addClass('disabled');
			var that = this;
			var creds = $('#password-resetor').serializeObject();

			$.get('/find_password/' + creds.email, function (data){
				$('#password-resetor-message').html('邮件已发送');
				$('#btnSave').html('Confirm');
				$('#btnSave').removeClass('disabled');
			});

			return false;
		}
	});

	App.View.UserRegister = Backbone.View.extend({
		templateId : 'tpl-user-register',

		events: {
			"click #btnRegister" 	: 		"register"
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},		

		render: function() {
			$(this.el).html(this.template());
			return this;
		},

		register: function() {
			var that = this;
			var creds = $('#user-register').serializeObject();

			var user = new App.Model.User(creds);
			user.save(creds, {
				success: function(model, resp) {
					$('#user-register-message').html('帐号创建成功，请前往邮箱激活。');
				},
				error: function(model, resp) {
					var message = resp.getResponseHeader('message');
					$('#user-register-message').html(message);
				}
			});

			return false;
		}
	});

	App.View.UserActive = Backbone.View.extend({
		templateId : 'tpl-user-active',

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},		

		render: function() {
			$(this.el).html(this.template(this.model));
			return this;
		}
	});

	App.View.UserPanel = Backbone.View.extend({
		templateId: 'tpl-user-panel',

		initialize: function() {
			var html = loadTemplate(this.templateId);
			this.template = _.template(html);

			var that = this;
			this.model.on('change:auth', function(){
                that.render();
            });
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});
});