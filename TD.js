var map;
var userMarker;
var generatedMarker;
var dirService;
var dirRenderer;
var TDMapRoute;
var wave = 0;
var money = 100;
var Lives = 100;
var routeIntervals = [];
var targets = [];
var weapons = [{
		price: 50,
		range: 200,
		damage: 30,
		icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
	},
	{
		price: 120,
		range: 350,
		damage: 75,
		icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
	},
	{
		price: 250,
		range: 200,
		damage: 200,
		icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
	},
	{
		price: 500,
		range: 700,
		damage: 150,
		icon: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
	}];
var selectedWeapon;
var placedWeapons = [];
var weaponInterval;
var waveMultiplier;

$( document ).ready(function() {
    refreshLives();
    refreshMoney();
    refreshWave();
});

function refreshLives() {
	$("#lives").text("Lives: " + Lives);
}

function refreshMoney() {
	$("#money").text("Money: " + money);
}

function refreshWave() {
	$("#wave").text("Wave: " + wave);
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: {lat: 47.542163, lng: 21.639760},
		streetViewControl: false,
		fullscreenControl: false,
		styles: [
		    {
		        "featureType": "all",
		        "elementType": "labels.text.fill",
		        "stylers": [
		            {
		                "saturation": 36
		            },
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 40
		            }
		        ]
		    },
		    {
		        "featureType": "all",
		        "elementType": "labels.text.stroke",
		        "stylers": [
		            {
		                "visibility": "on"
		            },
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 16
		            }
		        ]
		    },
		    {
		        "featureType": "all",
		        "elementType": "labels.icon",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "administrative",
		        "elementType": "geometry.fill",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 20
		            }
		        ]
		    },
		    {
		        "featureType": "administrative",
		        "elementType": "geometry.stroke",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 17
		            },
		            {
		                "weight": 1.2
		            }
		        ]
		    },
		    {
		        "featureType": "landscape",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 20
		            }
		        ]
		    },
		    {
		        "featureType": "poi",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 21
		            }
		        ]
		    },
		    {
		        "featureType": "road.highway",
		        "elementType": "geometry.fill",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 17
		            }
		        ]
		    },
		    {
		        "featureType": "road.highway",
		        "elementType": "geometry.stroke",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 29
		            },
		            {
		                "weight": 0.2
		            }
		        ]
		    },
		    {
		        "featureType": "road.arterial",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 18
		            }
		        ]
		    },
		    {
		        "featureType": "road.local",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 16
		            }
		        ]
		    },
		    {
		        "featureType": "transit",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 19
		            }
		        ]
		    },
		    {
		        "featureType": "water",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#000000"
		            },
		            {
		                "lightness": 17
		            }
		        ]
		    }
		]
	});

	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
			if (!place.geometry) {
				console.log("Returned place contains no geometry");
				return;
			}

			if (place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
			});
		map.fitBounds(bounds);
	});

	/*marker = new google.maps.Marker({
		map: map,
		draggable: true,
		animation: google.maps.Animation.DROP,
		position: {lat: 59.327, lng: 18.067},
		icon: "https://dimmi-static.azureedge.net/img/components/menu-dots-20x20.svg?d=171127"
	});
	marker.addListener('click', toggleBounce);*/

	addClickEventListener();

	// init directions service
	dirService = new google.maps.DirectionsService();
	dirRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
	dirRenderer.setMap(map);

	google.maps.Circle.prototype.contains = function(latLng) {
		return this.getBounds().contains(latLng) && google.maps.geometry.spherical.computeDistanceBetween(this.getCenter(), latLng) <= this.getRadius();
	}
}

function addClickEventListener() {
	google.maps.event.addListener(map, 'click', function(event) {
		google.maps.event.clearListeners(map, 'click');
		addClickEventListenerToPutWeaponsOnMap();
		addUserMarker(event.latLng, map);
		codeLatLng(event.latLng);
	});
}

function addClickEventListenerToPutWeaponsOnMap() {
	google.maps.event.addListener(map, 'click', function(event) {
		addWeapon(event.latLng, map);
	});
}

function addUserMarker(location, map) {
		userMarker = new google.maps.Marker({
			position: location,
			map: map
		});
}

//TODO This is still not so good :(
function codeLatLng(latLng) {
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'latLng': latLng }, function (results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			zoomMap();
			generateRandomCoordinate();
			highlightTDMap();
		} else {
			userMarker.setMap(null);
 			addClickEventListener();
		}
	});
}

function toggleBounce() {
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}

function zoomMap() {
	map.setZoom(15);
	map.setCenter(userMarker.position);
}

function generateRandomCoordinate() {
	var location = new google.maps.LatLng(
		userMarker.getPosition().lat() + (Math.random() / 100 * ((Math.round(Math.random()) % 2) ? 1 : -1)),
		userMarker.getPosition().lng() + (Math.random() / 100 * ((Math.round(Math.random()) % 2) ? 1 : -1))
	);
	generatedMarker = new google.maps.Marker({
		position: location,
		map: map
	});
}

function highlightTDMap() {
	// highlight a street
	var request = {
		origin: userMarker.getPosition().lat() + "," + userMarker.getPosition().lng(),
		destination: generatedMarker.getPosition().lat() + "," + generatedMarker.getPosition().lng(),
		travelMode: google.maps.TravelMode.DRIVING
	};
	userMarker.setMap(null);
	generatedMarker.setMap(null);
	dirService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			TDMapRoute = result.routes[0];
			dirRenderer.setDirections(result);
			new google.maps.Marker({
				position: TDMapRoute.overview_path[0],
				map: map,
				icon: "http://maps.google.com/mapfiles/kml/pal2/icon13.png"
			});
			new google.maps.Marker({
				position: TDMapRoute.overview_path[TDMapRoute.overview_path.length - 1],
				map: map,
				icon: "http://maps.google.com/mapfiles/kml/pal2/icon10.png"
			});
		}
	});
}

var tmp;

function startWave() {
	tmp = 0;
	document.getElementById("startButton").disabled = true;
	startWeaponInterval();
	wave++;
	refreshWave();
	waveMultiplier = (1 + wave / 10.0);
	var numOfTargets = Math.round(10 * waveMultiplier);

	for(var i = 0; i < numOfTargets; i++) {
		targets.push({
			id: i,
			hp: Math.round(100 * waveMultiplier),
			speed: 70 * waveMultiplier,
			value: Math.round(1 * waveMultiplier),
			position: 0,
			marker: null
		});
		setTimeout(function(){ moveTargetOnRoute(targets[tmp]); }, 2000 * (i + 1) / waveMultiplier);
	}
}

function moveTargetOnRoute(target) {
	tmp++;
	console.log(target.id);
	if(target != undefined && target != null) {
		target.marker = new google.maps.Marker({
				position: TDMapRoute.overview_path[0],
				map: map,
				icon: "./24899097_1968664976503837_1898904013_n.png"
			});
		animateMarker(target, TDMapRoute.overview_path, target.speed);
	}
}

var delay = 100;
function animateMarker(target, coords, km_h) {
	var targetIndex = 0;
	var km_h = km_h || 50;

	function goToPoint() {
		var lat = target.marker.position.lat();
		var lng = target.marker.position.lng();
		var step = (km_h * 1000 * delay) / 3600000; // in meters

		var dest = coords[targetIndex];

		var distance = google.maps.geometry.spherical.computeDistanceBetween(dest, target.marker.position); // in meters

		var numStep = distance / step;
		var i = 0;
		var deltaLat = (coords[targetIndex].lat() - lat) / numStep;
		var deltaLng = (coords[targetIndex].lng() - lng) / numStep;

		function moveMarker() {
			if(targets.includes(target)) {
				lat += deltaLat;
				lng += deltaLng;
				i += step;

				if (i < distance) {
					target.marker.setPosition(new google.maps.LatLng(lat, lng));
					setTimeout(moveMarker, delay);
				} else {
					target.marker.setPosition(dest);
					targetIndex++;

					if (targetIndex == coords.length){ 
						Lives--;
						refreshLives();
						if(lives == 0) {
							gameOver();
						}
						removeTarget(target);
						return; 
					}

					setTimeout(goToPoint, delay);
				}
			}
		}
		moveMarker();
	}
	goToPoint();
}

function weaponClicked(caller) {
	unHighlight();
	var index = caller.id.slice(-1);
	selectedWeapon = weapons[index];
	if(money >= selectedWeapon.price) {
		highlight(caller);
	} else {
		selectedWeapon = null;
	}
}

function highlight(caller) {
	$(caller).addClass("selected");
}

function unHighlight() {
	selectedWeapon = null;
	$("#weapon0").removeClass("selected");
	$("#weapon1").removeClass("selected");
	$("#weapon2").removeClass("selected");
	$("#weapon3").removeClass("selected");
}

function addWeapon(location, map) {
	if(selectedWeapon != null) {

		placedWeapons.push({
			target: targets[0],
			damage: selectedWeapon.damage,
			range: selectedWeapon.range,
			marker: new google.maps.Marker({
			position: location,
			map: map,
			icon: selectedWeapon.icon
			}),
			radius: new google.maps.Circle({
            strokeColor: '#00ff00',
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: '#00ff00',
            fillOpacity: 0.2,
            clickable: false,
            map: map,
            center: location,
            radius: selectedWeapon.range
          })
		});

		money -= selectedWeapon.price;
		refreshMoney();
		if(money < selectedWeapon.price) {
			unHighlight();
		}
	}
}

function weaponsShoot() {
	placedWeapons.forEach(function(element){
		shoot(element);
	});
}

function shoot(weapon) {
	var target = getTarget(weapon);
	if(target != null) {
		target.hp -= weapon.damage;
		if(target.hp <= 0) {
			removeTarget(target);
			weapon.target = null;
		} else {
			weapon.target = target;
		}
	}
}

function getTarget(weapon) {
	if(weapon.target != null && weapon.target.marker != null &&  weapon.radius.contains(weapon.target.marker.position)) {
		return weapon.target;
	} else {
		for(var i = 0; i < targets.length; i++) {
			if(targets[i].marker != null && weapon.radius.contains(targets[i].marker.position)) {
				return targets[i];
			}
		}
		return null;
	}
}

function removeTarget(target) {
	var index = targets.indexOf(target);
	if(index != -1) {
		if(target.hp <= 0) {
			money += target.value;
			refreshMoney();
		}
		target.marker.setMap(null);
		targets.splice(targets.indexOf(target), 1);
		if(targets.length == 0) {
			stopWeaponInterval();
			document.getElementById("startButton").disabled = false;
			money += Math.round(10 * waveMultiplier);
			refreshMoney();
		}
		tmp--;
	}
}

function startWeaponInterval() {
	weaponInterval = setInterval(function(){ weaponsShoot(); },500);
}

function stopWeaponInterval() {
	clearInterval(weaponInterval);
}

//TODO
function gameOver() {

}