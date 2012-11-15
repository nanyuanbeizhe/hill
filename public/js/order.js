$(function () {
	App = window.App || {};
	App.Model = window.App.Model || {};
	App.Collection = window.App.Collection || {};
	App.View =  window.App.View || {};

	/*
	 * Models
	 */ 
	App.Model.Order = Backbone.Model.extend({
		idAttribute: "_id",
		url: '/orders'
	});

	/**
	 * Collection
	 */
 	App.Collection.OrderCollection = Backbone.Collection.extend({
		model: App.Model.Order,
		url: '/orders',

		calcMonthReportData: function() {
			var r = {};
			var reports = r.userReports = {};
			var shops = r.shops = {};
			r.total = 0;
			//TODO: use user id as key
			this.each(function(order) {
				if(!reports[order.get('userName')]) {
					var userReport = {};
					userReport.userName = order.get('userName');
					userReport.userId = order.get('userId');
					userReport.unpaid = 0;
					userReport.orders = [];
					reports[order.get('userName')] = userReport;
				}

				reports[order.get('userName')].unpaid += order.get('totalCost');
				reports[order.get('userName')].orders.push(order);
				r.total += order.get('totalCost');

				if(!shops[order.get('shopName')]) {
					var shop = {};
					shop.name = order.get('shopName');
					shop.orders = [];
					shop.total = 0;
					shops[order.get('shopName')] = shop;
				}

				shops[order.get('shopName')].total += order.get('totalCost');
				shops[order.get('shopName')].orders.push(order);
			});

			return r;
		},

		calcDayReportData: function() {
			var r = {};
			var reports = r.reports = {};

			this.each(function(order){
				var lineItems = order.get('lineItems');
				
				for(var i in lineItems){
					var lineItem = lineItems[i];

					if(!reports[lineItem.name]) {
						var orderDayCount = {};
						orderDayCount.foodName = lineItem.name;
						orderDayCount.foodPrice = lineItem.unitCost;
						orderDayCount.foodDiscount = lineItem.discount;
						orderDayCount.foodShopName = order.get('shopName');
						orderDayCount.amount = 0;
						orderDayCount.foodImageUrl = lineItem.imageUrl;
						orderDayCount.orders = [];
						reports[lineItem.name] = orderDayCount;
					}

					reports[lineItem.name].amount += lineItem.count;
					reports[lineItem.name].orders.push(order);
				}
			});

			return r;
		}
	});

	/**
	 * Views
	 */
	App.View.Order = Backbone.View.extend({
		templateId: 'tpl-order-small',

		events: {
			"click .deleteOrder":   "deleteOrder"
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		deleteOrder: function() {
			this.model.destroy({
                success: function(model, resp) {
                },
                error: function(model, resp) {
                }
			});
		}
	});

	App.View.OrderList = Backbone.View.extend({
		templateId: 'tpl-order-list',

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			var total = 0;
			$(this.el).html('');

			this.model.each(function(order){
				$(this.el).prepend(new App.View.Order({model: order}).render().el);
				total += new Number(order.get('totalCost'));
			}, this);

			$(this.el).prepend(this.template({total: total, number: this.model.length}));
			return this;
		}
	});

	App.View.MonthReport = Backbone.View.extend({
		templateId: 'tpl-month-report',

		events: {
			"click .show-shopDetail":   "showShopDetail",
			"click .show-userDetail":   "showUserDetail",
			"mouseover .username": 		"showUserEmail",
			"mouseleave .username": 	"hideUserEmail"
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			this.data = this.model.calcMonthReportData();
			$(this.el).html(this.template(this.data));
			return this;
		},

		showShopDetail: function(e) {
			var name = $(e.target).parent().prev().prev().html();
			var orders = this.data.shops[name].orders;
			var orderCollection = new App.Collection.OrderCollection(orders);
			var detailView = new App.View.OrderList({model: orderCollection});
			$('.modal-body').html(detailView.render().el);
		},

		showUserDetail: function(e) {
			var name = $(e.target).parent().prev().prev().html();
			var orders = this.data.userReports[name].orders;
			var orderCollection = new App.Collection.OrderCollection(orders);
			var detailView = new App.View.OrderList({model: orderCollection});
			$('.modal-body').html(detailView.render().el);	
		},

		showUserEmail: function(e) {
			var name = $(e.target).html();
			var userId = this.data.userReports[name].userId;
			var user = new App.Model.User({_id: userId});
			user.fetch({
				success: function(model, resp){
					$(e.target).popover({placement: 'top', title: 'Email', content: model.get('email')});
					$(e.target).popover('show');
				}
			});
		},

		hideUserEmail: function(e) {
			$(e.target).popover('hide');
		}
	});

	App.View.DayReport = Backbone.View.extend({
		templateId: 'tpl-day-report',

		events: {
			"click .toggle-dayCount-detail":   "toggleDetail"
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			this.data = this.model.calcDayReportData();
			$(this.el).html(this.template(this.data));
			return this;		
		},

		toggleDetail: function(e) {
			var name = $(e.target).parent().parent().prev().children('dd:first').html();
			var orders = this.data.reports[name].orders;
			var orderCollection = new App.Collection.OrderCollection(orders);
			var detailView = new App.View.OrderList({model: orderCollection});
			$('.modal-body').html(detailView.render().el);
		}
	});

	App.View.OrderSelector = Backbone.View.extend({
		templateId: 'tpl-order-selector',

		events: {
			"click button#query": "query"
		},

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			var that = this;
			$(this.el).html(this.template());
			$(this.el).find('#reportrange').daterangepicker(
				{
					ranges: {
						'Today': ['today', 'today'],
						'Yesterday': ['yesterday', 'yesterday'],
						'Last 7 Days': [Date.today().add({ days: -6 }), 'today'],
						'Last 30 Days': [Date.today().add({ days: -29 }), 'today'],
						'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
						'Last Month': [Date.today().moveToFirstDayOfMonth().add({ months: -1 }), Date.today().moveToFirstDayOfMonth().add({ days: -1 })]
					},
					opens: 'left',
					format: 'MM/dd/yyyy',
					startDate: Date.today().add({ days: -29 }),
					endDate: Date.today(),
					minDate: '01/01/2012',
					maxDate: '12/31/2013',
		        	locale: {
		            		applyLabel: 'Submit',
		           			fromLabel: 'From',
		            		toLabel: 'To',
		            		customRangeLabel: 'Custom Range',
		            		daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
		            		monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		            		firstDay: 1
		        	}
				}, 
				function(start, end) {
					$('#reportrange span').html(start.toString('MMMM d, yyyy') + ' - ' + end.toString('MMMM d, yyyy'));
					that.options.start = start;
					that.options.end = end;
				}
			);

			//Set the initial state of the picker label
			$(this.el).find('#reportrange span').html(that.options.start.toString('MMMM d, yyyy') + ' - ' + that.options.end.toString('MMMM d, yyyy'));
			
			return this;
		},

		query: function() {
			var that = this;

		    this.model.fetch({
		    	data: {
		    		start: that.options.start.toString('MMMM d, yyyy'),
		    		end: that.options.end.toString('MMMM d, yyyy'),
		    		admin: that.options.admin
		    	}
		    }); 
		}
	});

	App.View.OrderButtons = Backbone.View.extend({
		templateId: 'tpl-order-buttons',
		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));
		},

		render: function() {
			$(this.el).html(this.template());
			return this;
		}
	}); 

	App.View.OrderMenu = Backbone.View.extend({
		templateId: 'tpl-order-menu',

		initialize: function() {
			this.template = _.template(loadTemplate(this.templateId));

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