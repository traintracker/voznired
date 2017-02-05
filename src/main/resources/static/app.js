var savedTrainsKey = 'saved-trains-' + $(document.body).attr('data-country');
var form = $('#search-form');
var input = $('#train-no-input');
var button = $('#submit-button');
var saved = $('#saved-trains');
var saveLink;

focusInput();
generateMyTrainsList();

Mousetrap.bind({
	'/': focusInput,
	'h': toggleDetails,
	'r': submitSearch,
	'c': countrySelector,
	'?': displayShortcuts
});

Mousetrap.bindGlobal('esc', blurInput);

input.keyup(function() {
	var value = $(this).val();
	var empty = value.length == 0;
	var disabled = button.is(':disabled');

	if (!empty) {
		form.attr('action', value);
		if (disabled) {
			button.removeAttr('disabled');
		}
	}
	else if (!disabled) {
		form.removeAttr('action');
		button.attr('disabled', 'disabled');
	}
});

form.submit(function(event) {
	$.pjax.submit(event, '#train-data');
});

$('a[data-train]').click(function(event) {
	var train = $(this).attr('data-train');
	input.val(train);
	input.keyup();
	$.pjax.click(event, '#train-data');
});

$('#train-data').on('pjax:success', function() {
	var trainNo = input.val();
	decorateVoyageReport(trainNo);
});

function focusInput() {
	input.focus();
}

function blurInput() {
	input.blur();
}

function toggleDetails() {
	$('#stations').collapse('toggle');
}

function submitSearch() {
	form.submit();
}

function countrySelector() {
	$('#country').modal('show');
}

function displayShortcuts() {
	$('#shortcuts').modal('show');
}

function saveMyTrains(myTrains) {
	localStorage.setItem(savedTrainsKey, JSON.stringify(myTrains));
}

function loadMyTrains() {
	return JSON.parse(localStorage.getItem(savedTrainsKey)) || [];
}

function addTrain(trainNo) {
	var myTrains = loadMyTrains();

	if (myTrains.indexOf(trainNo) != -1) {
		return;
	}

	myTrains.push(trainNo);
	saveMyTrains(myTrains);
}

function removeTrain(trainNo) {
	var myTrains = loadMyTrains();
	var index = myTrains.indexOf(trainNo);

	if (index == -1) {
		return;
	}

	myTrains.splice(index);
	saveMyTrains(myTrains);
}

function containsTrain(trainNo) {
	var myTrains = loadMyTrains();
	return myTrains.indexOf(trainNo) != -1;
}

function generateMyTrainsList() {
	saved.empty();
	var myTrains = loadMyTrains();

	if (myTrains.length > 0) {
		myTrains.sort(function(a, b) {
			return a - b;
		});

		myTrains.forEach(function(train) {
			if (!saved.is(':empty')) {
				saved.append('&nbsp;')
			}
			saved.append('<a class="btn btn-primary btn-sm" href="' + train
				+ '" role="button" data-train="' + train + '">' + train + '</a>');
		});

		$('.remove-my-train').click(function(event) {
			var trainNo = $(this).attr('data-train-no');
			event.preventDefault();
			removeTrain(trainNo);
			if (trainNo == saveLink.attr('data-train-no')) {
				prepareSaved(saveLink);
			}
			generateMyTrainsList();
		});
	}
	else {
		saved.append('<p class="text-left text-muted">' + messages['saved.empty'] + '</p>')
	}
}

function prepareNotSaved(link) {
	link.attr('title', messages['saved.remove'])
		.find('span.glyphicon')
		.removeClass('glyphicon-star-empty')
		.addClass('glyphicon-star');
}

function prepareSaved(link) {
	link.attr('title', messages['saved.add'])
		.find('span.glyphicon')
		.removeClass('glyphicon-star')
		.addClass('glyphicon-star-empty');
}

function decorateVoyageReport(trainNo) {
	$('#generated-time').text(messages['voyage.generated'].replace('{0}',
		new Date().toTimeString()));

	input.blur();
	saveLink = $('#save');

	if (containsTrain(trainNo)) {
		prepareNotSaved(saveLink);
	}
	else {
		prepareSaved(saveLink);
	}

	saveLink.click(function(event) {
		event.preventDefault();
		var trainNo = $(this).attr('data-train-no');

		if (containsTrain(trainNo)) {
			removeTrain(trainNo);
			prepareSaved(saveLink);
		}
		else {
			addTrain(trainNo);
			prepareNotSaved(saveLink);
		}

		generateMyTrainsList();
	});
}
