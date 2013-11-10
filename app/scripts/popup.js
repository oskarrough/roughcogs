var Roughcogs = {

	settings: {
		type: 'list',
		table: $('.mpitems'),
		collection: $('.mpitems').children('tbody'),
		max: 0
	},

	init: function(options) {
		this.settings = $.extend(this.settings, options);
		this.settings.self = this;
		s = this.settings;

		console.log('Roughcogs initialized');

		// Only run if there is a table
		var table = s.table.length > 0;
		if (!table) {
			console.log('no table found');
			return false;
		}

		// Check the type of page we are on
		var release = s.table.find('thead').length > 0;
		if (release) {
			s.type = 'release';
			s.table.addClass('Roughcogs--release');
		}
		else {
			s.table.addClass('Roughcogs--list');
		}

		// GOGOGOGO
		s.table.addClass('Roughcogs-table is-loading');

		if (s.type === 'list') {
			this.header();
			this.columns();
		}

		if (s.type === 'release') {
			this.columnsRelease();
		}

		if (s.type === 'list') {
			this.tablesorting();
		}

		if (s.type === 'release') {
			this.tablesortingRelease();
		}
		s.table.removeClass('is-loading').addClass('is-processed');
	},

	header: function() {
		var $headerRow = s.collection.children('tr').eq(0);
		$headerRow
			// create a thead
			.insertBefore(s.collection).wrap('<thead>')
			// change <td> to <th>
			.find('td').each(function(){
				s.self.changeTagName(this, 'th');
			}).end()
			// insert missing column to fit the ones in tbody
			.append('<th align="center">Buy</th>')
			// remove colspan
			.find('th:first').removeAttr('colspan')
			// and insert missing column to fit the one in tbody
			.before('<th>Cover</th>').end();
	},

	columns: function() {
		s.self.addTableHeader(2, 'Haves');
		s.self.addTableHeader(3, 'Wants');
		s.self.addTableHeader(4, 'Ratio');

		s.collection.children('tr').each(function(index) {
			s.self.price($(this));
			s.self.haves($(this));
			s.self.wants($(this));
			s.self.ratio($(this));
			//	s.self.graphs($(this));
		});
	},

	columnsRelease: function() {
		s.collection.children('tr').each(function(index) {
			s.self.price($(this));
		});
	},

	// where needs to be an index
	addTableHeader: function(where, text) {
		var $headerRow = s.table.find('thead').children('tr');
		$headerRow.children('th').eq(where).after('<th>'+ text +'</th>');
	},

	getHaves: function($row) {
		// find the string containing the haves
		var $communityEl = $row.children('td:eq(2)');
		var $dataContainer = $communityEl.find('tr:first').find('td:first');
		var data = $dataContainer.text();

		// filter it out using a regular expression
		var r = /\d+/;
		data = data.match(r);

		return data;
	},

	getWants: function($row) {
		// find the string containing the wants
		var $communityEl = $row.children('td').eq(2);
		var $dataContainer = $communityEl.find('tr:last').find('td:first');
		var data = $dataContainer.text();

		// filter it out using a regular expression
		var r = /\d+/;
		data = data.match(r);

		return data;
	},

	haves: function($row) {
		// get
		var haves = this.getHaves($row);
		// set
		$('<td class="rc" valign="top">'+ haves +'</td>').insertAfter($row.children('td:eq(2)'));
		this.saveData($row, 'haves', haves);
	},

	wants: function($row) {
		// get
		var wants = this.getWants($row);
		// set
		$('<td class="rc" valign="top">'+ wants +'</td>').insertAfter($row.children('td:eq(3)'));
		this.saveData($row, 'wants', wants);
	},

	rating: function($row) {
		var $communityEl = $row.children('td').eq(2);

		// TODO
		this.saveData($row, 'rating', rating);
	},

	getRatio: function($row) {
		var $communityEl = $row.children('td').eq(2);

		// get the values
		var haves = $row.data('haves');
		var wants = $row.data('wants');

		// calculate the ratio
		var ratio = wants / haves;
		var ratiov2 = (wants * 0.2) / (haves); // different method

		// round it to two decimals
		data = Math.round(ratio * 100) / 100;

		return data;
	},
	ratio: function($row) {
		// get
		var ratio = this.getRatio($row);
		// set
		$('<td class="rc" valign="top">'+ ratio +'</td>').insertAfter($row.children('td:eq(4)'));
		this.saveData($row, 'ratio', ratio);
	},

	price: function($row){

		// get the price <td>
		var $priceContainer = $row.children('td:last-child').prev('td');
		if (s.type === 'release') {
			$priceContainer = $row.children('td:eq(2)');
		}

		var otherCurrency = $priceContainer.find('i').length > 0;
		var currency;

		// get element containg the price
		var $price = $priceContainer.find('.price');
		if (otherCurrency) {
			$price = $priceContainer.find('i');
		}

		// get the price without currency
		var price = $price.text();

		// define which currency is the primary one
		if (otherCurrency) {
			currency = price.charAt(7);
		} else {
			currency = price.charAt(0);
		}

		if (s.type === 'release') {
			s.table.find('th:eq(2)').html('Price in ' + currency);
		} else {
			s.table.find('th:last-child').prev('th').html('Price in ' + currency);
		}

		// strip to only the price
		var newPrice = price.substr(price.indexOf(currency) + 1);
		// remove extra last ')' character
		if (otherCurrency) {
			newPrice = newPrice.slice(0, - 1);
		}

		//console.log(price + ' --> ' + currency + newPrice);
		$priceContainer.html(newPrice);
		this.saveData($row, 'price', newPrice);
	},

	graphs: function($row) {
		// get the single highest value of haves and wants
		var rowMax = Math.max( $row.data('haves'), $row.data('wants') );

		if (rowMax > s.max) {
			s.max = rowMax;
		}

		this.saveData($row, 'max', rowMax);
		// divide every value like this: have/max*100
	},

	tablesorting: function() {
		var table = $('.mpitems').dataTable({
			// disable inline px widths
			'bAutoWidth': false,
			// disable pagination
			'bPaginate': false,
			// show a processing indicator
			'bProcessing': true,
			//'bSortClasses': false,
			'aoColumnDefs': [
				// disable sorting on 'cover', 'sellerinfo' and 'buy'
				{ 'bSortable': false, 'aTargets': [ 0,-3, -1 ] },
				// hide community data
				{ 'bVisible': false, 'aTargets': [ 2 ] },
				// change default sorting method to descending
				{ 'asSorting': [ 'desc', 'asc' ], 'aTargets': [ 3,4,5] },
				// set 'haves', 'wants', 'ratio' and 'price' as numeric values
				{ 'sType': 'numeric', 'aTargets': [ 3,4,5,7 ] }
			]
		});

		// Sort immediately with 'price' column
		table.fnSort([ [2,'asc'] ]);
	},

	tablesortingRelease: function() {
		var table = $('.mpitems').dataTable({
			// disable inline px widths
			'bAutoWidth': false,
			// disable pagination
			'bPaginate': false,
			// show a processing indicator
			'bProcessing': true,
			//'bSortClasses': false,
			'aoColumnDefs': [
				// disable sorting on 'condition', 'seller info' and 'buy'
				{ 'bSortable': false, 'aTargets': [ 0,1,-1 ] },
				// change default sorting method to descending
				{ 'asSorting': [ 'desc', 'asc' ], 'aTargets': [ 2 ] },
				// set 'price' as numeric values
				{ 'sType': 'numeric', 'aTargets': [ 2 ] }
			]
		});

		// Sort immediately with 'price' column
		table.fnSort([ [2,'asc'] ]);
	},

	saveData: function($row, property, value) {

		// set the data as attr on the row
		$row.attr('data-' + property + '', value).data(property, value);

		// if (s.type === 'list') {
		// 	var $communityEl = $row.children('td').eq(2);
		// 	$communityEl.append('<div class="Rough-'+ property +'"><em>' + value + '</em> '+ property +'</div>');
		// }
	},

	changeTagName: function(el, newTagName) {
		var n = document.createElement(newTagName);
		var attr = el.attributes;
		for (var i = 0, len = attr.length; i < len; ++i) {
			n.setAttribute(attr[i].name, attr[i].value);
		}
		n.innerHTML = el.innerHTML;
		el.parentNode.replaceChild(n, el);
	}

};

$(function(){
	Roughcogs.init();
});
