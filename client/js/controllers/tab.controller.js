App.TabController = Ember.ArrayController.extend({
	title: 'dawg',

	filteredContent: Ember.computed.filterBy('content', 'channel', '#ircanywhere-test'),
	// filter it to a specific channel

	ready: function() {
		this.set('content', this.socket.findAll('tabs'));
		// set the content when we're ready

		console.log(this.get('content'));
	}
});

Ember.Handlebars.helper('json', function(value, options) {
	return JSON.stringify(value);
});