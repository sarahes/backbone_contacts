(function ($) {
	
	var View = Backbone.View.extend({
		tagName: 'article',
		id: 'todoView',
		className: 'todo'
	});

	var simpleView = new View();

	console.log(simpleView.el);

} (jQuery));`