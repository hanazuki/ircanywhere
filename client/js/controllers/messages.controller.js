App.MessagesController = Ember.ArrayController.extend({
	needs: ['index'],
	tabs: [],
	events: [],
	readDocs: [],

	filtered: Ember.arrayComputed('sorted', 'controllers.index.tabId', {
		addedItem: function(accum, item) {
			var tab = this.get('tabs').filterProperty('_id', this.get('controllers.index.tabId'))[0],
				target = (tab && tab.type === 'network') ? '*' : tab.title;
				
			if ((item.type === 'privmsg' || item.type === 'action' || item.type === 'notice') && !item.read) {
				item.set('unread', true);
				item.set('read', true);
			}

			if (tab && item.network === tab.networkName && item.target === target) {
				accum.pushObject(item);
			}

			return accum;
		},
		
		removedItem: function(accum, item) {
			var tab = this.get('tabs').filterProperty('_id', this.get('controllers.index.tabId'))[0],
				target = (tab && tab.type === 'network') ? '*' : tab.title;

			if (tab && item.network === tab.networkName && item.target === target) {
				accum.removeObject(item);
			}

			return accum;
		}
	}),

	sorted: function() {
		var results = this.get('events'),
			sorted = Ember.ArrayProxy.createWithMixins(Ember.SortableMixin, {
				content: results,
				sortProperties: ['message.time'],
				sortAscending: true
			});

		return sorted;
	}.property('events').cacheable(),

	ready: function() {
		this.set('tabs', this.socket.findAll('tabs'));
		this.set('events', this.socket.findAll('events'));
		// we have to use the direct data set for events because we wont be able to
		// take advantage of it's live pushing and popping
		// ie new events immediately becoming visible with no effort
	},

	markAsRead: function() {
		var query = {'$or': []};
		this.get('readDocs').forEach(function(id) {
			query['$or'].push({_id: id});
		});
		// construct a query from docs

		if (this.get('readDocs').length > 0) {
			this.socket.update('events', query, {read: true});
			this.set('readDocs', []);
		}
		// send the update out
	},

	actions: {
		detectUnread: function(id, top, bottom, container) {
			var self = this,
				tab = this.get('tabs').filterProperty('_id', id)[0],
				events = this.get('filtered').filterProperty('unread', true),
				counter = 0;
				docs = [];

			events.forEach(function(item) {
				var el = container.find('div.row[data-id=' + item._id + ']'),
					topOffset = el[0].offsetTop;

				if (top === 0 || top < topOffset && topOffset < bottom) {
					// XXX - Handle highlights

					item.set('unread', false);
					if (self.readDocs.indexOf(item._id) === -1) {
						self.readDocs.push(item._id);
						counter++;
					}
				}
			});

			var unread = tab.get('unread') - counter;
				unread = (unread <= 0) ? 0 : unread;
				tab.set('unread', unread);
			// update the icon
			
			if (this.get('timeout')) {
				return false;
			}
			// already a pending timeout

			var scrollTimeout = setTimeout(function() {
				self.markAsRead();
				self.set('timeout', null);
			}, 5000);

			this.set('timeout', scrollTimeout);
		}
	}
});