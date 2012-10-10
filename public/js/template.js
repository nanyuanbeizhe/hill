$(function () {
	App = window.App || {};
	App.TemplateManager = window.App.TemplateManager || {};

	var promises = {};

	var loadTemplateAsync = function(tmpId){
	    var promise = promises[tmpId] || $.get("/templates/" + tmpId + ".html");
	    promises[tmpId] = promise;
	    return promise;
	}

	App.TemplateManager.loadTemplate = function(templateId, callback){
	    var tmpId = templateId.replace("#", "");
	    var promise = loadTemplateAsync(tmpId);
	    promise.done(function(template){
	      	callback.call(this, template);
	    });
	}

});