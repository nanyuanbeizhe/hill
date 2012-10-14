$(function () {
	App = window.App || {};
	App.Model = window.App.Model || {};
	App.Collection = window.App.Collection || {};
	App.View =  window.App.View || {};

	/**
	 * Models
	 */ 
	App.Model.Food = Backbone.Model.extend({
		idAttribute: "_id",
		urlRoot: '/food'
	});

	/**
	 * Collection
	 */
	App.Collection.FoodCollection = Backbone.Collection.extend({
		model: App.Model.Food,
		url: '/food',

		sortByShop: function() {
			var sorted = this.sortBy(function (food){
				return food.get('shopName') + food.get('title');
			});

			return sorted;
		}
	});

	/**
	 * Views
	 */
	App.View.Food = Backbone.View.extend({
		tagName: 'li',
		className: 'span3',
		templateId: 'tpl-food-small',

		events: {
			"click .food":                          "showDetail",
			"click .modal .add_shoppingcart":       "onClick",
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		showDetail: function() {
			$('#' + this.model.get("_id")).modal('show');
		},

		onClick: function() {
	      var s = '#' + this.model.get('_id') + ' input';
	      var food = this.model.toJSON();
	      
		  var item = new App.Model.ShoppingCartItem({
		  	id: this.model.get('title'),
		  	price: this.model.get('price'),
		  	discount: this.model.get('discount'),
		  	count: parseInt($(s).val()),
		  	imageUrl: food.images[0].url,
		  	shopName: this.model.get('shopName')
		  });

		  console.log(item.get('count'));
		  App.shoppingCart.addItem(item);
	      $('#' + this.model.get("_id")).modal('hide');
		}
	});

	App.View.FoodCollection = Backbone.View.extend({
		templateId: 'tpl-food-list',
		viewName: 'foodCollection',

		initialize: function() {
			var html = loadTemplate(this.templateId);
			this.template = _.template(html);
		},

		render: function() {
			var that = this;
			$(this.el).html(this.template());
			var container = $(this.el).find('#food');

			var sorted = this.model.sortByShop();
			for(var i in sorted){
				container.append(new App.View.Food({model: sorted[i]}).render().el);
			}
			
			container.imagesLoaded(function(){
                container.masonry({
                    itemSelector : '.span3'
                });
            });			

			return this;
		}
	});

	App.View.FoodEditor = Backbone.View.extend({
		templateId : 'tpl-food-edit',

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
			var creds = $('#food-editor').serializeObject();
			that.model.save(creds, {
				success: function(model, resp) {
					that.model = model;
					$('#food-editor-message').html('修改成功');
				},
				error: function(model, resp) {
					var message = resp.getResponseHeader('message');
					$('#food-editor-message').html('修改失败: ' + message);
				}
			});
			return false;
		}
	});
});