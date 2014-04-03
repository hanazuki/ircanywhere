App.IndexController = Ember.ObjectController.extend(App.Visibility, {
	needs: ['infolist'],
	tabId: null,

	init: function() {
		this.bindVisibility();
	},

	tabChanged: function() {
		var user = this.get('socket.users').objectAt(0),
			tab = this.get('socket.tabs').findBy('url', user.selectedTab);

		if (tab) {
			var url = tab.get('url').split('/');

			if (tab.get('type') === 'network') {
				this.transitionToRoute('network', url[0]);
			} else {
				this.transitionToRoute('tab', url[0], exports.Helpers.encodeChannel(url[1]));
			}
			// move the route to the selected tab

			this.set('tabId', tab.get('_id'));
			// change the tab id
		}
	}.observes('socket.users.@each.selectedTab'),
	
	determinePath: function() {
		if (this.socket.authed === null) {
			this.socket.connect();
		}
	},

	isAuthed: function() {
		if (this.socket.authed === false) {
			this.transitionToRoute('login');
		} else {
			Raven.setUser({
				email: this.get('socket.users.0.email'),
				id: this.get('socket.users.0._id')
			});
		}
	}.observes('socket.authed'),

	ready: function() {
		this.tabChanged();
	},

	onBanList: function(data) {
		this.send('openModal', 'infolist');
		this.controllerFor('infolist').populateData(data);
	}
});