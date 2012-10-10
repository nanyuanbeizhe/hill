$(function () {
	App = window.App || {};
	App.Model = window.App.Model || {};
	App.Collection = window.App.Collection || {};
	App.View =  window.App.View || {};

    /**
     * Model
     */
	App.Model.ShoppingCartItem = Backbone.Model.extend({
		increase: function(num){
			this.set('count', this.get('count') + num);
		}
	});

    /**
     * Collection
     */
	App.Collection.ShoppingCartItemCollection = Backbone.Collection.extend({
		model: App.Model.ShoppingCartItem,

		initialize: function(){
			this.fetch();
		},

		save: function(successCallback, errorCallback) {
			var lines = this.length;
			$.cookie('lines', lines);
			var i = 1;
			this.each(function(item){
				$.cookie('item_name_' + i, item.get('id'));
				$.cookie('item_price_' + i, item.get('price'));
				$.cookie('item_discount_' + i, item.get('discount'));
				$.cookie('item_count_' + i, item.get('count'));
				$.cookie('item_imageurl_' + i, item.get('imageUrl'));
				$.cookie('item_shopName_' + i, item.get('shopName'));
				i++;
			});
		},
		
		fetch: function() {
			var items = [];
			var lines = $.cookie('lines');
			if(!lines) lines = 0;

			for(var i = 1; i <= lines; i++){
				var item = new App.Model.ShoppingCartItem({
					id : $.cookie('item_name_' + i),
					price : new Number($.cookie('item_price_' + i)),
					discount : new Number($.cookie('item_discount_' + i)),
					count : new Number($.cookie('item_count_' + i)),
					imageUrl : $.cookie('item_imageurl_' + i),
					shopName : $.cookie('item_shopName_' + i)
				});
				items.push(item);
			}

			this.reset(items);
		},

		addItem: function(item) {
			var oldItem = this.get(item.get('id'));
			if(oldItem){
				oldItem.increase(item.get('count'));
			}else{
				this.add(item);
			}

			this.save();
		},

		getTotalCost: function() {
			var totalCost = 0;
			this.each(function(item) {
				totalCost += item.get('count') * item.get('price') * item.get('discount');
			});

			return totalCost;
		},

		getTotalCount: function() {
			var totalCount = 0;
			this.each(function(item) {
				totalCount += new Number(item.get('count'));
			});

			return totalCount;
		},

		generateOrders: function() {
			var orders = {};
			this.each(function(item){
				var shopName = item.get('shopName');

				if(!orders[shopName]){
					orders[shopName] = {};
					orders[shopName].shopName = shopName;
					orders[shopName].lineItems = [];
					orders[shopName].totalCost = 0;
				}

				var lineItem = new Object();
				lineItem.name = item.get('id');
				lineItem.unitCost = item.get('price');
				lineItem.discount = item.get('discount');
				lineItem.count = item.get('count');
				lineItem.imageUrl = item.get('imageUrl');

				orders[shopName].lineItems.push(lineItem);
				orders[shopName].totalCost += lineItem.unitCost * lineItem.discount * lineItem.count;
			});

			return orders;
		},

		empty: function() {
			this.reset();
			this.save();
		}
	});
    
    /**
     * Views
     */

     App.View.ShoppingCartItem = Backbone.View.extend({
		tagName: 'tr',
		templateId: 'tpl-shoppingcart-item',

		events: {
//			"click .shoppingcartitem":          "onClick"
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},
/*
		onClick: function() {
			this.trigger('click_food', this.model);
			$('#' + this.model.get("_id")).modal('show');
		}
*/		
	});

	App.View.ShoppingCart = Backbone.View.extend({
		templateId: 'tpl-shoppingcart',
		events: {
			'click #btn-empty': 'emptyCart'
		},

		initialize: function() {
			var html = loadTemplate(this.templateId);
			this.template = _.template(html);
		},

		render: function() {
			var that = this;
			$(this.el).html(this.template({totalCost: this.model.getTotalCost()}));
			this.model.each(function(shoppingCartItem){
				$('#items').prepend(new App.View.ShoppingCartItem({model: shoppingCartItem}).render().el);
			});

			var now = new Date();
            $('#countdown_dashboard').countDown({
                targetDate: {
                    'day':      now.getDate(),
                    'month':    now.getMonth()+1,
                    'year':     now.getFullYear(),
                    'hour':     11,
                    'min':      0,
                    'sec':      0
                },
                onComplete: function() {
                	$('#checkout').addClass('disabled'); 
                	$('#checkout').removeAttr('href');
                }
			});

			return this;
		},

		emptyCart: function() {
			this.model.empty();
			this.render();
		}
	});

	App.View.ShoppingCartSmall = Backbone.View.extend({
		templateId: 'tpl-shoppingCart-small',

		initialize: function() {
			var html = loadTemplate(this.templateId);
			this.template = _.template(html);

			var that = this;
			this.model.on('all', function(){
                that.render();
            });
		},

		render: function() {
			$(this.el).html(this.template({count: this.model.getTotalCount()}));
			return this;
		}
	});

	App.shoppingCart = new App.Collection.ShoppingCartItemCollection();
});