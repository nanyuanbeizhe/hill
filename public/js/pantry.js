$(function () {
	App = window.App || {};
	App.Model = {};
	App.Collection = {};
	App.View = {};
	/*
	 * Models
	 */ 
	App.Model.Order = Backbone.Model.extend({
		idAttribute: "_id"
	});

	App.Model.Food = Backbone.Model.extend({
		idAttribute: "_id"
	});

	App.Model.User = Backbone.Model.extend({
		idAttribute: "_id",
		urlRoot: '/users'
	});

	App.Model.ShoppingCartItem = Backbone.Model.extend({
		increase: function(num){
			this.set('count', new Number(this.get('count')) + num);
		}
	});

	App.Model.Session = Backbone.Model.extend({
		urlRoot: '/session',
		auth: false,				// default

		initialize: function (){
			this.save({
				success: function (model, response){

				},
				error: function (model, response){

				}
			})
		}
	});

	/**
	 * Collection
	 */
 	App.Collection.OrderCollection = Backbone.Collection.extend({
		model: App.Model.Order,
		url: '/orders'
	});
	 	
	App.Collection.FoodCollection = Backbone.Collection.extend({
		model: App.Model.Food,
		url: '/food'
	});

	App.Collection.UserCollection = Backbone.Collection.extend({
		model: App.Model.User,
		url: '/users'
	});

	App.Collection.ShoppingCartItemCollection = Backbone.Collection.extend({
		model: App.Model.ShoppingCartItem,

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

	/**
	 * Views
	 */
	App.View.Food = Backbone.View.extend({
		tagName: 'li',
		className: 'span3',
		template: _.template($('#tpl-food').html()),

		events: {
			"click .food":          "onClick"
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		onClick: function() {
			this.trigger('click_food', this.model);
		}
	});

	App.View.FoodCollection = Backbone.View.extend({
		el: '#main',
		template: _.template($('#tpl-food-collection').html()),
		food_el: "#food",
		viewName: 'foodCollection',

		render: function() {
			$(this.el).html(this.template());
			this.model.each(function(food){				
				$(this.food_el).append(new App.View.Food({model: food}).render().el);
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

	App.View.Order = Backbone.View.extend({
		template: _.template($('#tpl-order').html()),

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});

	App.View.OrderCollection = Backbone.View.extend({
		el: '#main',
		template: _.template($('#tpl-order-collection').html()),
		orders_el: '#ordersEntry',
		navCurPos: -1,
		viewName: 'orderCollection',

		render: function(reportType) {
			this.model.each(function(order){
				$(this.orders_el).prepend(new App.View.Order({model: order}).render().el);
			},this);

			return this;
		}
	});
});

// Utils
$.ajaxSetup({cache:false});
$.fn.serializeObject = function(){
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
}

function formatDate(date, friendly) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    if (friendly) {
    var now = new Date();
    var mseconds = -(date.getTime() - now.getTime());
    var time_std = [ 1000, 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000 ];
    if (mseconds < time_std[3]) {
      if (mseconds > 0 && mseconds < time_std[1]) {
        return Math.floor(mseconds / time_std[0]).toString() + ' 秒前';
      }
      if (mseconds > time_std[1] && mseconds < time_std[2]) {
        return Math.floor(mseconds / time_std[1]).toString() + ' 分钟前';
      }
      if (mseconds > time_std[2]) {
        return Math.floor(mseconds / time_std[2]).toString() + ' 小时前';
      }
    }
    }

    //month = ((month < 10) ? '0' : '') + month;
    //day = ((day < 10) ? '0' : '') + day;
    hour = ((hour < 10) ? '0' : '') + hour;
    minute = ((minute < 10) ? '0' : '') + minute;
    second = ((second < 10) ? '0': '') + second;

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}

function formatNumber(number, decimals, dec_point, thousands_sep) {

    number = (number + '').replace(/[^0-9+-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/B(?=(?:d{3})+(?!d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

function roleCheck(roleName, roles){
    for(var i in roles){
        if(roleName == roles[i].name) return true;
    }

    return false;
}