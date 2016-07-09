var myApp = angular.module('myApp',[]);

myApp.controller('AppCtrl',
['$scope','$http',
function($scope,$http) {
	console.log("Hello world from controller");
	
	
	$scope.doPost = function () {
		console.log("REQ");
		console.log($scope.object);
		$http.post('/servicio',$scope.object).success(function(response){
			console.log("RES");
			console.log(response);
		});
	};
	
}]);