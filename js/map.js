var Map                   = {};
var directionsService     = new google.maps.DirectionsService();
var polygons_coords       = [];
var polygons              = [];
var route_polygons        = [];
var route_polygons_coords = [];
var waypts                = [];
var directionsDisplay;
var map;

Map['initialize'] = function() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var hotel = new google.maps.LatLng(HOTEL_COORDS.latitude, HOTEL_COORDS.longitude);
  var myOptions = {
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: hotel
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
  directionsDisplay.setMap(map);
};

Map['generatePolygon'] = function(route, color) {
  var polygon_coords = [];

  // Polygon coords
  for (var i = 0; i < route.legs.length; i += 1) {
    var leg              = route.legs[i];
    var polygon_location = leg.start_location;
    var marker_icon;

    polygon_coords.push(polygon_location);

    if (i == 0) {
      marker_icon = 'img/hotel.png';
    } else {
      marker_icon = 'img/'+ i +'.png';
    }

    // Attraction marker
    new google.maps.Marker({
      position: polygon_location,
      map: map,
      icon: marker_icon
    });
  }
  polygons_coords.push(polygon_coords);

  // Polygons
  polygons.push(new google.maps.Polygon({
    paths: polygons_coords[0],
    strokeColor: color,
    strokeOpacity: 1,
    strokeWeight: 3,
    fillColor: color,
    fillOpacity: 0
  }));
  polygons[0].setMap(map);
};

Map['generateRoutePolygon'] = function(route, color) {
  var route_polygon_coords = [];
  console.log(route);

  for (var i = 0; i < route.legs.length; i += 1) {
    var leg = route.legs[i];

    for (var j = 0; j < leg.steps.length; j += 1) {
      var step = leg.steps[j];

      for (var k = 0; k < step.lat_lngs.length; k += 1) {
        var lat_lng = step.lat_lngs[k];
        route_polygon_coords.push(lat_lng);
      }
    }
  }
  route_polygons_coords.push(route_polygon_coords);

  // Polygons
  route_polygons.push(new google.maps.Polygon({
    paths: route_polygons_coords[0],
    strokeColor: color,
    strokeOpacity: 1,
    strokeWeight: 3,
    fillColor: color,
    fillOpacity: 0
  }));
  route_polygons[0].setMap(map);
};

Map['generateWaypoints'] = function() {
  for (var i = 0; i < ATTRACTIONS.length; i++) {
    var attractions = ATTRACTIONS[i];

    for (var j = 0; j < attractions.length; j += 1) {
      var attraction     = attractions[j];
      var waypt_location = new google.maps.LatLng(attraction.latitude, attraction.longitude);

      waypts.push({
        location: waypt_location,
        stopover:true
      });
    }
  }
};

Map['traceRoute'] = function() {
  var start = new google.maps.LatLng(HOTEL_COORDS.latitude, HOTEL_COORDS.longitude);
  var end = new google.maps.LatLng(HOTEL_COORDS.latitude, HOTEL_COORDS.longitude);

  Map.generateWaypoints()

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

      Map.generatePolygon(route, '#FF0000');
      Map.generateRoutePolygon(route, '#0000FF');

      summaryPanel.innerHTML = '';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        if (i == 0) {
          summaryPanel.innerHTML += '<b>Hotel</b><br />';
        } else {
          summaryPanel.innerHTML += '<b>Route Segment: ' + i + '</b><br />';
        }
        summaryPanel.innerHTML += route.legs[i].start_address + ' até ';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br />';
        summaryPanel.innerHTML += route.legs[i].distance.text + '<br /><br />';
      }
    }
  });
};

