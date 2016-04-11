var app = angular.module('leafletdraw-serialize', []).controller('MapController', function($scope, $http, $interval) {

    $scope.apiuri = 'http://localhost:3000/';

    // Initialize map
    $scope.leaflet = L.map('map').setView([42.35, -71.08], 13);

    L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png',
    {
        attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
        maxZoom: 17,
        minZoom: 9
     }).addTo($scope.leaflet);

    // Initialize feature group
	$scope.featureGroup = new L.FeatureGroup();
	$scope.leaflet.addLayer($scope.featureGroup);

    // Initialize map editor
    $scope.drawControl = new L.Control.Draw({
        position : 'bottomleft',
        draw : {
            polygon : {
                allowIntersection : false,
                showArea : true,
                drawError : {
                    color : '#b00b00',
                    timeout : 1000
                }
            },
            polyline : false,
            marker : false,
            circle : false
        },
        edit : {
            edit: true,
            featureGroup : $scope.featureGroup
        }
    });
    $scope.leaflet.addControl($scope.drawControl);

    $scope.leaflet.on('draw:created', function (e) {
        $scope.createLayer(e.layer);
    });
    $scope.leaflet.on('draw:deleted', function(e) {
        $scope.deleteLayers(e.layers);
    });
    $scope.leaflet.on('draw:edited', function(e) {
        $scope.editLayers(e.layers);
    })

    // GET layers from REST API
    $scope.loadLayers = function() {
        $http.get($scope.apiuri + 'objects').success(function(data, status, xhr) {
            $scope.featureGroup.clearLayers();

            data.forEach(function(object) {
                if (object != null) {
                    L.geoJson(JSON.parse(object.geoJSON), {
                        onEachFeature : function(feature, layer) {
                            layer.object = object;
                            $scope.featureGroup.addLayer(layer);
                        }
                    });
                }
            });
        });
    };

    // Layer has been created, PUT to REST API
    $scope.createLayer = function(layer) {
        $http.put($scope.apiuri + "objects", {"geoJSON" : JSON.stringify(layer.toGeoJSON())}).success(function() {
            $scope.loadLayers();
        });
    };

    // Layers have been edited, POST to REST API
    $scope.editLayers = function(layers) {
        layers.eachLayer(function(layer) {
            $http.post($scope.apiuri +  "objects/" + layer.object.object_id, {
            'geoJSON' : JSON.stringify(layer.toGeoJSON())
            });
        });
    };

    // Layers have been removed, DELETE to REST API
    $scope.deleteLayers = function(layers) {
        layers.eachLayer(function(layer) {
            $http.delete($scope.apiuri + "objects/" + layer.object.object_id);
        });
    };

    $scope.loadLayers();
});
