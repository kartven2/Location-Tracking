/*- 
Copyright [2020] Karthik.V
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
var trackId = null;
var map = null;
var locations = [];
var options = { enableHighAccuracy: true, timeout: 90000, maximumAge: 0};
var markers = [];
var infoWindow = null;
var t1=0,t2=0;

function displayLatLong(position) {
    var timeTag = document.getElementById("time");
    t2 = Date.now();
    timeTag.innerHTML += "Time to compute geolocation :" + (t2-t1) + " milliseconds <br>" 

	var lat = position.coords.latitude;
	var long = position.coords.longitude;
	var pTag = document.getElementById("location");
	pTag.innerHTML = "Latitude: " + lat + ", Longitude: " + long + "<br>";

	var googleLoc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	locations.push(googleLoc);
}

function displayLocation(position) {
    displayLatLong(position);
	var accuracy = position.coords.accuracy;
	var time = new Date(position.timestamp);
	var iTag = document.getElementById("info");
	iTag.innerHTML = "Location Timestamp: "+ time + "<br>";
	iTag.innerHTML += "Location Accuracy: "+ accuracy + " meters<br>";

	if(position.coords.altitude) {
		iTag.innerHTML += "Altitude: "+ position.coords.altitude + "<br>";
	}

	if(position.coords.altitudeAccuracy) {
		iTag.innerHTML += "Altitude Accuracy: "+ position.coords.altitudeAccuracy + "<br>";
	}

	if(position.coords.speed) {
		iTag.innerHTML += "Speed: "+ position.coords.speed + " meters/sec<br>";
	}

	if(position.coords.heading) {
		iTag.innerHTML += "Heading: "+ position.coords.heading + "<br>";
	}

	showMap(position.coords);	
}

function displayError(error) {
	var errorTypes = ["Unknown Error", "Permission denied by user", "Position not available", "Timeout error"];
	alert("Unable to get GeoLocation information Reason:" + errorTypes[error.code]);
	console.error("Error in getting your location: " + errorTypes[error.code], error.message);
}

function computeTotalDistance() {
	var distance = 0;
	if(locations.length > 1) {
		for(var i=1; i<locations.length; i++) {
			distance += google.maps.geometry.spherical.computeDistanceBetween(locations[i-1], locations[i]);
		}
	}
	return distance;
}

function showMap(coords) {
	var googleLatLong = new google.maps.LatLng(coords.latitude, coords.longitude);
	var mapOptions = {
		zoom: 11,
		center: googleLatLong,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var mapDiv = document.getElementById("map");
	map = new google.maps.Map(mapDiv, mapOptions);
	infoWindow = new google.maps.InfoWindow();

	google.maps.event.addListener(map, "click", function(event) {
      var selectedLat = event.latLng.lat();
      var selectedLng = event.latLng.lng();

	  var pTag = document.getElementById("location");
	  pTag.innerHTML = "Latitude: " + selectedLat + ", Longitude: " + selectedLng + "<br>";
	  map.panTo(event.latLng);

	  //create marker
	  createMarker(event.latLng);
	});

	showSearchForm();
}

function createMarker(latLng) {
	var markerOptions = {
       position: latLng,
       map: map,
       clickable: true
	};

	var marker = new google.maps.Marker(markerOptions);
	markers.push(marker);

	google.maps.event.addListener(marker, "click", function(event){
          infoWindow.setContent("Location: "+ event.latLng.lat().toFixed(2) + "," + event.latLng.lng().toFixed(2));
          infoWindow.open(map, marker);
	});
}

function showSearchForm() {
	var searchFormTag = document.getElementById("searchForm");
	searchFormTag.style.visibility = "visible";

	var searchButtonTag = document.getElementById("search");
	searchButtonTag.onclick = function(event) {
        event.preventDefault();

	};
}

function track() {
	trackId = navigator.geolocation.watchPosition(displayLatLong, displayError, options);
}

window.onload = function() {
  if(!navigator.geolocation) {
  	alert("Sorry the web browser doesn't support geolocation !!!");
  	return;
  }
  var timeTag = document.getElementById("time");
  timeTag.innerHTML = "enableHighAccuracy: " + options.enableHighAccuracy + ", timeout: " + options.timeout +", maximumAge: "+ options.maximumAge +" <br>";
  t1 = Date.now();
  navigator.geolocation.getCurrentPosition(displayLocation, displayError, options);

  var dTag = document.getElementById("distance");
  var trackButton = document.getElementById("track");
  trackButton.onclick = function(e) {
  	e.preventDefault();
  	if(trackButton.innerHTML == "Start") {
  		trackButton.innerHTML = "Stop";
  		track();
  	} else {
  		trackButton.innerHTML = "Start";
  		//clearTracking();
  		var d = computeTotalDistance();
  		var miles = d/1.6;
  		if(d==0) {
  			dTag.innerHTML = "You didn't travel anywhere at all";
  		} else {
  			d = Math.round(d * 1000)/1000;
  			dTag.innerHTML = "Total distance traveled: " + d + "km <br>";
  			dTag.innerHTML = "Total distance traveled: " + miles + "miles <br>";
  		}
  	}
  };
}