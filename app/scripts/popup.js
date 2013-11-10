var Roughcogs = {

	settings: {
		type: 'list',
		table: $('.mpitems'),
		collection: $('.mpitems').children('tbody')
	},

	init: function(options) {
		this.settings = $.extend(this.settings, options);
		this.settings.self = this;
		s = this.settings;

		console.log('Roughcogs initialized');

		// Only run if there is a table
		var tableExists = s.table.length < 1;
		if (tableExists) {
			console.log('no table found');
			return false;
		}

		// Check the type of page we are on
		var releaseList = s.table.find('thead').length > 0;
		if (releaseList) {
			s.type = 'release';
		}

		// GOGOGOGO
		s.table.addClass('is-loadingRoughCogs');

		if (s.type === 'list') {
			this.header();
			this.columns();
		}

		if (s.type === 'release') {
			this.columnsRelease();
		}

		//this.tablesorting();
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
		// we are adding new cols for haves, wants and ratio
		// so add the complementary <th> for them
		var $headerRow = s.collection.children('tr').eq(0);
		// insert them after the 3rd col
		$headerRow.find('th:eq(2)')
			.after('<th>Haves</th><th>Wants</th><th>Ratio</th>');

		s.collection.children('tr').each(function(index) {
			s.self.haves($(this));
			s.self.wants($(this));
			s.self.ratio($(this));
			s.self.price($(this));
		});
	},

	columnsRelease: function() {
		s.collection.children('tr').each(function(index) {
			s.self.price($(this));
		});
	},

	haves: function($row) {
		// find the string containing the haves
		var $communityEl = $row.children('td').eq(2);
		var $haveEl = $communityEl.find('tr:first').find('td:first');
		var haves = $haveEl.text();

		// filter it out using a regular expression
		var r = /\d+/;
		haves = haves.match(r);

		$('<td class="rc" valign="top">'+ haves +'</td>').insertAfter($communityEl);
		this.saveData($row, 'haves', haves);
	},

	wants: function($row) {
		// find the string containing the wants
		var $communityEl = $row.children('td').eq(2);
		var $wantEl = $communityEl.find('tr:last').find('td:first');
		var wants = $wantEl.text();

		// filter it out using a regular expression
		var r = /\d+/;
		wants = wants.match(r);

		$('<td class="rc" valign="top">'+ wants +'</td>').insertAfter($communityEl.next('td'));
		this.saveData($row, 'wants', wants);
	},

	rating: function($row) {
		var $communityEl = $row.children('td').eq(2);

		// TODO
		this.saveData($row, 'rating', rating);
	},

	ratio: function($row) {
		var $communityEl = $row.children('td').eq(2);

		// get the values
		var haves = $row.data('haves');
		var wants = $row.data('wants');

		// calculate the ratio
		var ratio = wants / haves;
		var ratiov2 = (wants * 0.2) / (haves); // different method

		// round it to two decimals
		ratio = Math.round(ratio * 100) / 100

		// insert and save it
		$('<td class="rc" valign="top">'+ ratio +'</td>').insertAfter($communityEl.next('td').next('td'));
		this.saveData($row, 'ratio', ratio);
	},

	price: function($row){

		// get the price <td>
		if (s.type === 'release') {
			var $priceContainer = $row.children('td:eq(2)');
		} else {
			var $priceContainer = $row.children('td:eq(6)');
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

		s.table.find('th:eq(2)').html('Price in ' + currency);

		// strip to only the price
		var newPrice = price.substr(price.indexOf(currency) + 1);
		// remove extra last ')' character
		if (otherCurrency) {
			newPrice = newPrice.slice(0, - 1);
		}

		//console.log(price + ' --> ' + currency + newPrice);
		$priceContainer.html(newPrice);
		this.saveData($row, 'price', price);
	},

	getPrice: function(string) {

		// turn it into a js object and get the text
		price = $(string)[0].innerText;

		// remove currency symbol
		price = price.substring(1);

		return price;
	},

	graphs: function() {
		//var max = loop haves
	},

	saveData: function($row, property, value) {
		$row.attr('data-' + property + '', value).data(property, value);

		if (s.type === 'list') {
			var $communityEl = $row.children('td').eq(2);
			$communityEl.append('<div class="Rough-'+ property +'"><em>' + value + '</em> '+ property +'</div>');
		}
	},

	tablesorting: function() {
		$('.mpitems').dataTable({

			// disable pagination
			"bPaginate": false,

			// show a processing indicator
			"bProcessing": true,

			//"bSortClasses": false,

			"aoColumnDefs": [
				// disable sorting on 'cover' and 'buy'
				{ "bSortable": false, "aTargets": [ 0,-1 ] },

				// hide community data
				{ "bVisible": false, "aTargets": [ 2 ] },

				// change default sorting method to descending
				{ "asSorting": [ "desc", "asc" ], "aTargets": [ 3,4,5 ] },

				// set 'haves', 'wants' and 'ratio' as numeric values
				{ "sType": "numeric", "aTargets": [ 3,4,5 ] }


				// // temporary hide everything but price
				// { "bVisible": false, "aTargets": [ 0,1,3,4,5,7 ] },
				// {
				// 	"aTargets": [ 0 ],
				// 	"mData": function(source,type, val) {
				// 		var string = 'no price'
				// 		if (source[6]) {
				// 			string = s.self.getPrice( source[6] );
				// 		}
				// 		return string;

				// 	}
				// }
			]

		});
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
