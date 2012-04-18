var Map = {};
var map;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var waypts = [];
var polygon;
var polygon_coords = [];

Map['initialize'] = function() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var hotel = new google.maps.LatLng(HOTEL_COORDS.latitude, HOTEL_COORDS.longitude);
  var myOptions = {
    zoom:12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: hotel
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
  directionsDisplay.setMap(map);
};

Map['traceRoute'] = function() {
  var start = new google.maps.LatLng(HOTEL_COORDS.latitude, HOTEL_COORDS.longitude);
  var end = new google.maps.LatLng(HOTEL_COORDS.latitude, HOTEL_COORDS.longitude);

  // Hotel marker
  new google.maps.Marker({
    position: start,
    map: map,
    icon: 'img/hotel.png'
  });

  for (var i = 0; i < ATTRACTIONS.length; i++) {
    var attractions = ATTRACTIONS[i];
    waypt_location  = new google.maps.LatLng(attractions.latitude, attractions.longitude);

    waypts.push({
        location: waypt_location,
        stopover:true
    });
  }

  var request = {
    origin:start,
    destination:end,
    travelMode: google.maps.TravelMode.DRIVING,
    waypoints: waypts,
    optimizeWaypoints: true
  };

  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      // directionsDisplay.setDirections(response);
      var route = response.routes[0];
      var summaryPanel = document.getElementById('directions_panel');

      // Polygon coords
      for (var i = 0; i < route.optimized_waypoint_order.length; i += 1) {
        var index            = route.optimized_waypoint_order[i];
        var polygon_location = waypts[index].location;

        polygon_coords.push(polygon_location);

        // Attraction marker
        new google.maps.Marker({
          position: polygon_location,
          map: map,
          icon: 'img/'+ (i+1) +'.png'
        });
      }
      console.log(polygon_coords);

      // Polygon
      polygon = new google.maps.Polygon({
        paths: polygon_coords,
        strokeColor: '#FF0000',
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: '#FF0000',
        fillOpacity: 0
      });
      polygon.setMap(map);

      summaryPanel.innerHTML = '';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        if (i == 0) {
          summaryPanel.innerHTML += '<b>Hotel</b><br />';
        } else {
          summaryPanel.innerHTML += '<b>Route Segment: ' + i + '</b><br />';
        }
        summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br />';
        summaryPanel.innerHTML += route.legs[i].distance.text + '<br /><br />';
      }
    }
  });
};

