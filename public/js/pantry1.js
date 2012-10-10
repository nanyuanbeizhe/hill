$(function(){	
	var Model = {};
	var View = {};
	var Router = {};	
 	var App = {};

﻿	// Model
	Model.Order = Backbone.Model.extend({

	});

	Model.OrderCollection = Backbone.Collection.extend({
		model: Model.Order,
		url: '/orders'
	});

	Model.Food = Backbone.Model.extend({

	});

	Model.FoodCollection = Backbone.Collection.extend({
		model: Model.Food,
		url: '/food.json'
	});

	Model.ShoppingCartItem = Backbone.Model.extend({
		increase: function(num){
			this.set('count', this.get('count')+num);
		}
	});

	Model.ShoppingCartItemCollection = Backbone.Collection.extend({
		model: Model.ShoppingCartItem,

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
				var item = new Model.ShoppingCartItem({
					id : $.cookie('item_name_' + i),
					price : $.cookie('item_price_' + i),
					discount : $.cookie('item_discount_' + i),
					count : $.cookie('item_count_' + i),
					imageUrl : $.cookie('item_imageurl_' + i),
					shopName : $.cookie('item_shopName_' + i)
				});
				items.push(item);
			}

			this.reset(items);
		},

		addItem: function(item) {
			var oldItem = this.get(item.id);
			if(oldItem){
				oldItem.increase(1);
			}else{
				this.add(item);
			}

			this.save();
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
		}
	});

	Model.Session = Backbone.Model.extend({
		urlRoot: '/session',
		auth: false,				// default

		initialize: function() {
			this.fetch({
				success: function(model, resp) {
					App.session = model;
					App.router = new Router.App();
					Backbone.history.start();
				}
			});
		}
	});

	Model.User = Backbone.Model.extend({
		urlRoot: '/users'
	});

	// View
	View.Order = Backbone.View.extend({
		template: _.template($('#tpl-order').html()),

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});

	View.OrderCollection = Backbone.View.extend({
		el: '#main',
		template: _.template($('#tpl-order-collection').html()),
		orders_el: '#ordersEntry',
		navCurPos: -1,
		viewName: 'orderCollection',

		render: function(reportType) {
			var auth = App.session.get('auth');
			var roles = App.session.get('roles');
			$(this.el).html(this.template({isAdmin: roleCheck('admin', roles)}));

			if(!auth) {
				$(this.el).html('Your are not allowed to view the orders');
				return this;
			}

			if(!reportType) {
				this.toggleActiveItem(1);
				return this.renderAll();
			}

			if(reportType=='food' && roleCheck('admin', roles)) {
				this.toggleActiveItem(3);
				return this.renderFoodReport();
			}

			if(reportType == 'user' && roleCheck('admin', roles)) {
				this.toggleActiveItem(4);
				return this.renderUserReport();
			}

			return this;
		},

		renderAll: function() {
			this.model.each(function(order){
				$(this.orders_el).prepend(new View.Order({model: order}).render().el);
			},this);

			return this;
		},

		renderFoodReport: function() {
			var counts = {};

			this.model.each(function(order){
				var lineItems = order.get('lineItems');
				for(var i in lineItems){
					var lineItem = lineItems[i];

					if(!counts[lineItem.name]) {
						var orderDayCount = {};
						orderDayCount.foodName = lineItem.name;
						orderDayCount.foodPrice = lineItem.unitCost;
						orderDayCount.foodDiscount = lineItem.discount;
						orderDayCount.foodShopName = order.get('shopName');
						orderDayCount.amount = 0;
						orderDayCount.foodImageUrl = lineItem.imageUrl;
						orderDayCount.details = [];
						counts[lineItem.name] = orderDayCount;
					}

					counts[lineItem.name].amount += lineItem.count;
					counts[lineItem.name].details.push({
						'userName': order.get('userName'),
						'orderDate' : formatDate(new Date(order.get('date')), true),
						'count' : lineItem.count
					});
				}
			});

			for(var k in counts){
				$(this.orders_el).append(new View.OrderCountByDay({model: counts[k]}).render().el);
			}

			return this;
		},

		renderUserReport: function() {
			var r = {};
			var reports = r.userReports = {};
			r.total = 0;

			this.model.each(function(order) {
				if(!reports[order.get('userName')]) {
					var userReport = {};
					userReport.userName = order.get('userName');
					userReport.unpaid = 0;
					userReport.orders = [];
					reports[order.get('userName')] = userReport;
				}

				reports[order.get('userName')].unpaid += order.get('totalCost');
				reports[order.get('userName')].orders.push(order);
				r.total += order.get('totalCost');
			});

			$(this.orders_el).append(new View.OrderUserReport({model: r}).render().el);

			return this;
		},

		toggleActiveItem: function(i) {
			if(this.cur == i) return;
			if(this.cur >= 0){
				$(this.el).find('ul.nav li:eq(' + this.cur + ')').removeClass("active");
				$(this.el).find('ul.nav li:eq(' + this.cur + ') i').removeClass("icon-white");
			}
			$(this.el).find('ul.nav li:eq(' + i + ')').addClass("active");
			$(this.el).find('ul.nav li:eq(' + i + ') i').addClass("icon-white");
			this.cur = i;
		}
	});

	View.OrderCountByDay = Backbone.View.extend({
		className: 'well',
		template: _.template($('#tpl-order-dayCount').html()),
		detail: false,

		events: {
			"click .toggle-dayCount-detail":   "toggleDetail"
		},

		render: function() {
			$(this.el).html(this.template(this.model));
			return this;
		},

		toggleDetail: function() {
			$(this.el).find('table').toggle();
			var bt = $(this.el).find('.toggle-dayCount-detail');
			this.detail = !this.detail;
			var str = this.detail ? "折叠明细" : "展开明细";
			bt.html(str);
		}
	});

	View.OrderUserReport = Backbone.View.extend({
		template: _.template($('#tpl-order-user-report').html()),

		render: function() {
			$(this.el).html(this.template(this.model));
			return this;
		}
	});

	View.Food = Backbone.View.extend({
		tagName: 'li',
		className: 'span3',
		template: _.template($('#tpl-food').html()),

		events: {
			"click .food":          "addToShoppingCart"
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		addToShoppingCart: function() {
			if(this.options.shoppingCart){
				var food = this.model.toJSON();

				this.options.shoppingCart.addItem({
					id : food.title,
					price : food.price,
					discount : 1,
					count : 1,
					imageUrl : food.images[0].url,
					shopName : food.shopName
				});
			}
			return false;
		}		
	});

	View.FoodCollection = Backbone.View.extend({
		el: '#main',
		template: _.template($('#tpl-food-collection').html()),
		food_el: "#food",
		viewName: 'foodCollection',

		render: function() {
			$(this.el).html(this.template());
			this.model.each(function(food){				
				$(this.food_el).append(new View.Food({model: food, shoppingCart: this.options.shoppingCart}).render().el);
			}, this);

			var $container = $(this.food_el);
			$container.imagesLoaded(function(){
                $container.masonry({
                    itemSelector : '.span3'
                });
            });

			return this;
		}
	});

	View.Alert = Backbone.View.extend({
		className: 'alert',
		template: _.template($('#tpl-alert').html()),

		render: function(type) {
			$(this.el).html(this.template(this.model));
			if(type == 'success') $(this.el).addClass('alert-success');
			return this;
		}
	});

	View.Navigate = Backbone.View.extend({
		el: '#nav',
		template: _.template($('#tpl-nav-inner').html()),
		cur: -1,
		items_el: '#shoppingcart-items',
		totalCount_el: '#shoppingCart-count',

		events: {
			"click #btnLogin" 	: 		"login" ,
			"click #btnLogout" 	: 		"logout",
			"keypress #loginForm" :     "keypress",
			"keypress #registerForm" :     "keypress",
			'click #btnRegister'  :     "register"
		},

		initialize: function() {
			this.model.bind('add', this.addOneItem, this);
			this.model.bind('remove', this.removeItem, this);
			this.model.bind('reset', this.resetItems, this);
			this.model.bind('change:count', this.changeItemCount, this);
		},

		render: function() {
			$(this.el).html(this.template(App.session.toJSON()));
			this.changeItemCount();
			this.model.each(function(item){
				this.addOneItem(item);
			}, this);
/*			var frozTime = new Date();
			frozTime.setHours(11);
			frozTime.setMinutes(0);
			frozTime.setSeconds(0);
			if(new Date() > frozTime) {
				$('li#checkout').hide();
			}*/
			return this;
		},

		toggleActiveItem: function(i) {
			if(this.cur == i) return;
			if(this.cur >= 0){
				$(this.el).find('ul.nav li:eq(' + this.cur + ')').removeClass("active");
				$(this.el).find('ul.nav li:eq(' + this.cur + ') i').removeClass("icon-white");
			}

			$(this.el).find('ul.nav li:eq(' + i + ')').addClass("active");
			$(this.el).find('ul.nav li:eq(' + i + ') i').addClass("icon-white");
			this.cur = i;
		},

		login: function() {
			var that = this;
			$('.alert').remove();
			var creds = $('#loginForm').serializeObject();
			App.session.save(creds, {
				success: function(model, resp) {
					if(model.get('auth')){
						$('#login-panel').modal('hide')
						that.render();
					}else{
						$('#tab1').prepend(new View.Alert({model: {'server_msg' : model.get('error')}}).render().el);
					}
				}
			});
		},

		keypress: function(e) {
			if(e.keyCode == '13'){
				if(e.currentTarget.id == 'loginForm')
					this.login();
				if(e.currentTarget.id == 'registerForm')
					this.register();
			}
		},

		logout: function() {
			var that = this;
			App.session.destroy({
				success: function(model, resp) {
					App.session.clear();
					App.session.set({auth: false});
					that.render();
				}
			});
		},

		register: function(){
			var that = this;
			$('.alert').remove();
			var creds = $('#registerForm').serializeObject();

			var result = this.check(creds);
			if(result != 'success') {
				$('#tab2').prepend(new View.Alert({model: {server_msg: result}}).render().el);
				return false;
			}

			var user = new Model.User(creds);
			user.save(creds, {
				success: function(model, resp) {
					if(model.get('success')){
						$('#myTabs li:first a').tab('show');
						$('#tab1').prepend(new View.Alert({model: model.toJSON()}).render('success').el);
					} else {
						$('#tab2').prepend(new View.Alert({model: model.toJSON()}).render().el);
					}
				},
				error: function(model, resp) {
					console.log('failed');
					console.log(model);
				}
			});
		},

		check: function(creds) {
			if(!creds.email) return 'Need email';
			if(!creds.name) return 'Need name';
			if(!creds.password) return 'Need password';
			if(!creds.password_again) return 'Need input password again';
			if(creds.password != creds.password_again) return 'Passwords are not the same';

			if(creds.email != 'manch.09@sem.tsinghua.edu.cn'){
				emailSplits = creds.email.split('@');
				if(emailSplits[1] != 'microstrategy.com') return 'you must use @microstrategy.com';
			}

			return 'success';
		},

		addOneItem: function(item) {
			$(this.items_el).prepend(new View.ShoppingCartItem({model: item}).render().el);
			this.changeItemCount();
		},

		resetItems: function(items) {
			$('.shoppingcart-item').remove();
			this.changeItemCount();
			this.model.each(function(item){
				this.addOneItem(item);
			}, this);
		},

		changeItemCount: function(item) {
			$(this.totalCount_el).html(this.model.getTotalCount());
		},

		removeItem: function(item) {
			this.model.save();
			this.changeItemCount();
		}
	});

	View.ShoppingCartItem = Backbone.View.extend({
		tagName: 'li',
		className: 'shoppingcart-item',
		template: _.template($('#tpl-shoppingcart-item').html()),

		events: {
			"click span":  "decreaseItem"
		},

		initialize: function(options) {
			this.model.bind('change', this.changeCount, this);
			this.model.bind('destroy', this.destroyMyself, this);
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		changeCount: function(options) {
			this.render();
		},

		destroyMyself: function() {
			this.remove();
		},

		decreaseItem: function() {
			var count = new Number(this.model.get('count'));
			if(count > 1) this.model.set({'count': count-1});
			else {
				this.model.collection.remove(this.model);
				this.remove();
			}
		}
	});

	View.Foot = Backbone.View.extend({

		render: function() {
			return this;
		}
	});


	// Control
	Router.App = Backbone.Router.extend({
		routes: {
			'': 'listFood',
			'emptyCart': 'emptyShoppingCart',
			'checkout' : 'checkout',
			'login/:email/:message' : 'showLogin',

			'orders/:id' : 'getOrder',
			'orders' : 'listOrders',
			'orders/search/:query' : 'listOrders',
			'orders/search/:query/:type-report' : 'listOrders',

			'food/:id' : 'getFood',
			'food' : 'listFood',
			'food/search/:query' : 'listFood'
		},

		initialize: function(options) {
			//data
			this.foodCollection = new Model.FoodCollection();
			this.orderCollection = new Model.OrderCollection();
			this.shoppingCartItemCollection = new Model.ShoppingCartItemCollection();

			//views
			this.navigateView = new View.Navigate({model: this.shoppingCartItemCollection});
			this.orderCollectionView = new View.OrderCollection({model: this.orderCollection});
			this.foodCollectionView = new View.FoodCollection({model: this.foodCollection, shoppingCart: this.shoppingCartItemCollection});

			//init
			this.navigateView.render();
			this.shoppingCartItemCollection.fetch();
			App.session.on('change:auth', this.changeAuth, this);
		},

		changeAuth: function() {
			var url = Backbone.history.fragment;
			this.navigate('other');
			this.navigate(url, true);
		},

		getFood: function(id){

		},

		listFood: function(query) {
			var that = this;
			that.mainView = that.foodCollectionView;
			that.navigateView.toggleActiveItem(0);

			that.foodCollection.fetch({
				success: function(collection, response) {
					that.foodCollectionView.render();
				}
			});
		},

		getOrder: function(id) {

		},

		listOrders: function(query, reportType){
			var that = this;
			that.mainView = that.orderCollectionView;
			that.navigateView.toggleActiveItem(1);

			var queryData = {};
			if(query) {
				queryData.op = 'admin';
				queryData.dt = query;
			}

			that.orderCollection.fetch({
				data: queryData,
				success: function(collection, response) {
					that.orderCollectionView.render(reportType);
				}
			});
		},

		emptyShoppingCart: function() {
			this.shoppingCartItemCollection.reset();
			this.shoppingCartItemCollection.save();
			this.navigate('');
		},

		checkout: function() {
			var that = this;
/*			var frozTime = new Date();
			frozTime.setHours(11);
			frozTime.setMinutes(0);
			frozTime.setSeconds(0);
			if(new Date() > frozTime) {
				alert('Please order food before 11:00');
				return;
			}*/

			if(!App.session.get('auth')) {
				this.showLogin();
				return;
			}
			var orders = this.shoppingCartItemCollection.generateOrders();
			this.emptyShoppingCart();

			for(var key in orders){
				var result = this.orderCollection.create(orders[key]);

				if(!result){
					console.log('order create failed: ');
					console.log(orders[key]);
				}
			}
			setTimeout(function(){that.navigate('orders',true);}, 1000);
		},

		showLogin: function(email, message) {
			//this.navigate('food', true);
			$('#login-panel').modal('show');
			$('#tab1 #inputEmail').val(email);
			if(message)	$('#tab1').prepend(new View.Alert({model: {server_msg: message}}).render('success').el);
		}
	});
	
	App.session = new Model.Session();
});