var _ = require('underscore'),
	moment = require('moment'),
	expect = require('expect.js'),
	Recurrence = require('..');

// common function to test expected dates
function test_dates(pattern , expected_dates, callback) {
	var r = new Recurrence(pattern);
	expected_dates = _.map(expected_dates, function(d) { return Date.parse(d); });
	var generated = r.generate();

	if (expected_dates.length !== generated.length) return callback('Invalid number of results');

	for (var i = 0; i < generated.length; i++) {
		var expected = moment(expected_dates[i]),
			realised = generated[i];		
		if (expected.valueOf() !== realised.valueOf()) {
			return callback(expected_dates[i] + ' does not match generated date ' + generated[i]);
		}
	}
	return callback();
};

describe('by days with', function () {
	var base_pattern = {
		start: '02/21/2010',
		until: '03/07/2010',
		every: '1',
		unit: 'd',
		end_condition: 'until'
	};

	it('specific ending date and every is 1', function (done) {
		var expected_dates = [
		  '02/21/2010', '02/22/2010', '02/23/2010', '02/24/2010', '02/25/2010', '02/26/2010', '02/27/2010', '02/28/2010',
		  '03/01/2010', '03/02/2010', '03/03/2010', '03/04/2010', '03/05/2010', '03/06/2010', '03/07/2010'
		];

		test_dates(base_pattern, expected_dates, done);
	});

	it('specific ending date and every is more than 1', function (done) {
		var pattern = _.clone(base_pattern);
		pattern.every = '2';

		var expected_dates = [
		  '02/21/2010', '02/23/2010', '02/25/2010', '02/27/2010',
		  '03/01/2010', '03/03/2010', '03/05/2010', '03/07/2010'
		];

		test_dates(pattern, expected_dates, done);
	});

	it('number of occurences', function (done) {
		var pattern = _.clone(base_pattern);
		pattern.every = '2';
		pattern.end_condition = 'for';
		pattern.rfor = '6';

		var expected_dates = [
		  '02/21/2010', '02/23/2010', '02/25/2010', '02/27/2010',
		  '03/01/2010', '03/03/2010'
		];

		test_dates(pattern, expected_dates, done);
	});

	it('time information', function(done) {
		var pattern = _.extend(base_pattern, { start: '02/21/2010 7:00 PM', until: '03/07/2010 7:00 PM' });
		var expected_dates = [
		  '02/21/2010 7:00 PM', '02/22/2010 7:00 PM', '02/23/2010 7:00 PM', '02/24/2010 7:00 PM', '02/25/2010 7:00 PM', 
		  '02/26/2010 7:00 PM', '02/27/2010 7:00 PM', '02/28/2010 7:00 PM', '03/01/2010 7:00 PM', '03/02/2010 7:00 PM', 
		  '03/03/2010 7:00 PM', '03/04/2010 7:00 PM', '03/05/2010 7:00 PM', '03/06/2010 7:00 PM', '03/07/2010 7:00 PM'
		];

		test_dates(base_pattern, expected_dates, done);
	});

}); // describe by days

describe('by weeks with', function () {

	var base_pattern = {
		start: '02/21/2010',
		until: '03/21/2010',
		every: '1',
		unit: 'w',
		end_condition: 'until',
		days: [0]
	};

	it('specific ending date and one day a week', function (done) {
		var expected_dates = ['02/21/2010', '02/28/2010', '03/07/2010', '03/14/2010', '03/21/2010'];
		test_dates(base_pattern, expected_dates, done);
	});

	it('specific ending date and multiple days a week', function (done) {
		var pattern = _.clone(base_pattern);
		pattern.every = '2';
		pattern.days = [0, 3, 6];

		var expected_dates = ['02/21/2010', '02/24/2010', '02/27/2010', '03/07/2010', '03/10/2010', '03/13/2010', '03/21/2010'];
		test_dates(pattern, expected_dates, done);
	});

	// definitely needs more work
	it('#describe', function (done) {
		var r = new Recurrence(base_pattern);
		if (!r.describe().match(/Sunday/)) return done('Invalid description');
		return done();
	});

}); // describe by weeks

describe('with timezone offset', function() {

	it('should be able to generate with a timezone offset', function(done) {
		var start = moment('13-01-2014 06:30 AM +10:00', 'DD-MM-YYYY hh:mm a Z'),
			params = {
				start: start.toDate(),
				until: '03/21/2014',
				every: '1', 
				unit: 'w',
				end_condition: 'until',
				days: [1],
				timezone: '-0500'
			},
			r = new Recurrence(params),
			results = r.generate(),
			expected = [
				1389558600000,
				1389645000000,
				1390249800000,
				1390854600000,
				1391459400000,
				1392064200000,
				1392669000000,
				1393273800000,
				1393878600000,
				1394483400000,
				1395088200000
			];

		for (var i = 0; i < results.length; i++) {
			if (results[i] != expected[i]) {
				return done('Unexpected time');
			}
		}
		return done();
	});	
});

describe('by months with', function () {

	var pattern = {
		start: '1/6/2016',
		until: '12/31/2016',
		every: 1,
		unit: 'm',
		end_condition: 'until',
		nth: 1,
		occurrence_of: 3
	};

	it('specific ending date and once a month on first wednesday', function (done) {
		var expected_dates = ["01/06/2016", "02/03/2016", "03/02/2016", "04/06/2016", "05/04/2016", "06/01/2016", "07/06/2016", "08/03/2016", "09/07/2016", "10/05/2016", "11/02/2016", "12/07/2016"];
		test_dates(pattern, expected_dates, done);
	});

	it('number of occurrences and once a month on first wednesday', function (done) {
		var expected_dates = ["01/06/2016", "02/03/2016", "03/02/2016", "04/06/2016", "05/04/2016"];
		pattern.end_condition = 'for';
		pattern.rfor = 5;
		test_dates(pattern, expected_dates, done);
	});

	// definitely needs more work
	it('#describe', function (done) {
		var r = new Recurrence(pattern);
		if (!r.describe().match(/Every month on the first Wednesday starting on Jan 6, 2016/)) return done('Invalid description');
		return done();
	});

}); // describe by weeks