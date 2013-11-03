var s,
SliderWidget = {

	settings: {
		table: $('.mpitems'),
		collection: $('.mpitems').children('tbody')
	},

	init: function(options) {
		this.settings = $.extend(this.settings, options);
		this.settings.self = this;
		s = this.settings;

		this.prepareHTML();

		s.collection.children('tr').each(function(index) {
			s.self.haves($(this));
			s.self.wants($(this));
			s.self.ratio($(this));
			//s.self.price($(this));
		});

		this.tablesorting();

		s.table.addClass('is-processed');
	},

	prepareHTML: function() {
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

		// insert extra cols for our custom stuff
		$headerRow.find('th:eq(2)').after('<th>Haves</th><th>Wants</th><th>Ratio</th>');

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
		var $priceEl = $row.children('td:eq(3)');
		var price = $priceEl.find('.price').text();
		//var priceEuro = pricePounds.next('span i').text();

		// filter it out using a regular expression
		//var r = /\d+/;
		//pricePounds = pricePounds.match(r);

		price = price.substring(1);
		//$priceEl.html(Math.round(price * 8.77965874) + ' kr');
		$priceEl.html(price);

		this.saveData($row, 'price', price);
	},

	saveData: function($row, property, value) {
		var $communityEl = $row.children('td').eq(2);

		$communityEl.append('<div class="Rough-'+ property +'"><em>' + value + '</em> '+ property +'</div>');
		$row.attr('data-' + property + '', value).data(property, value);
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
	SliderWidget.init();
});
