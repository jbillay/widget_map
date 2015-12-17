

var $ = require('jquery');
require('jquery-ui');
var mrtSettings = {
    //domain: 'http://localhost:9615'
    domain: 'https://myruntrip-staging.herokuapp.com'
};

var mrtWidgetName = '#mrt_map';

// Get parameters
var mrtRunId = $(mrtWidgetName).attr('run');
if (typeof mrtRunId === 'undefined' ) {
    mrtRunId = 1;
}

var mrtApiKey = $(mrtWidgetName).attr('api-key');
if (typeof mrtApiKey === 'undefined' ) {
    mrtApiKey = null;
}

var mrtRunUrl = mrtSettings.domain + '/api/journey/run/' + mrtRunId;

$.ajax({
    url: mrtRunUrl,
    success: function (response) {
        var geocoder;
        var map;
        var makers;
        var infoWindow;

        var mapOptions = {
            center: { lat: 46.22764, lng: 2.21375},
            zoom: 5
        };
        geocoder = new google.maps.Geocoder();
        map = new google.maps.Map($(mrtWidgetName)[0], mapOptions);
        markers = infoWindow = [];

        response.forEach(function (journey) {
            var address = journey.address_start;
            var title = 'D�part pour la course ' + journey.Run.name;
            var info = '<div id="content"><div id="siteNotice"></div>'+
                '<a href="' + mrtSettings.domain + '/journey-' + journey.id + '">' +
                '<h4 id="firstHeading" class="firstHeading">D�part pour la course ' +
                journey.Run.name + '</h4></a>' + '<div id="bodyContent">' +
                '<p><i class="fa fa-exchange"></i> ' + journey.journey_type +  '</p>';

            if (journey.date_start_outward) {
                var dateStart = new Date(journey.date_start_outward);
                info = info + '<p><i class="fa fa-calendar"></i> Aller : ' +
                dateStart.toLocaleDateString() + ' ' +
                journey.time_start_outward + '</p>';
            }
            if (journey.date_start_return) {
                var dateReturn = new Date(journey.date_start_return);
                info = info + '<p><i class="fa fa-calendar"></i> Retour : ' +
                dateReturn.toLocaleDateString() + ' ' +
                journey.time_start_return + '</p>';
            }
            info = info + '<p><i class="fa fa-arrows-h"></i> ' + journey.distance + '</p>' +
            '<p><i class="fa fa-history"></i> ' + journey.duration + '</p>' +
            '<p><i class="fa fa-car"></i> ' + journey.car_type + '</p>'+
            '<p><i class="fa fa-eur"></i> <strong>' + journey.amount + '</strong></p></div></div>';

            geocoder.geocode( { 'address': address}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var infoWindowIdx = infoWindow.push(new google.maps.InfoWindow({
                            content: info
                        })) - 1;
                    var markerIdx = markers.push(new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location,
                            title: title
                        })) - 1;
                    markers[markerIdx].addListener('click', function() {
                        infoWindow[infoWindowIdx].open(map, markers[markerIdx]);
                    });
                }
            });
        });
    },
    failed: function( response ) {
        console.log("FAILED !!!!" + response);
    }
});
