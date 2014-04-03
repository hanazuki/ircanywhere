Raven.config('https://16983a638df648698af03bc088eecf22@app.getsentry.com/21985', {
	whitelistUrls: ['try.ircanywhere.com']
}).install();

report_error = function(e) {
	Raven.captureException(e);
}

Ember.onerror = report_error;
Ember.RSVP.configure('onerror', report_error);
window.onerror = report_error;
/* handle all our possible error triggers */