app.directive('myAdSense', function() {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    template: '<div ng-transclude></div>',
    link: function ($scope, element, attrs) {}
  }
})
app.directive('contenteditable', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {

			elm.bind('blur', function() {
				scope.$apply(function() {
					ctrl.$setViewValue(elm.html());
				});
			});

			ctrl.$render = function() {
				elm.html(ctrl.$viewValue);
			};
		}
	};
});
app.directive('mediaManager', function() {
	return {
		restrict: 'A',
		replace: true,
		transclude: true,
		template:	'<div>'+
				 		'<input type="file" class="hidden" accept="image/*" capture="camera">'+
						'<div ng-transclude></div>'+
					'</div>',
		scope: {
			callback: 	'=mediaManager'
		},
		link: function(scope, elem, attrs, ctrl) {
			if(typeof(scope.callback)!='function'){
				console.error('mediaManager: no callback defined.',scope.callback)
				return;
			}

			processDragOverOrEnter = function(event) {
				if (event != null) {
					event.preventDefault();
				}
				event.originalEvent.dataTransfer.effectAllowed = 'copy';
				return false;
			};
			resizeImage = function(imageData, maxWidth, maxHeight, callback){

				var img = new Image();
				img.onload = function () {
					var canvas = document.createElement('canvas');
					var ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0);
					var MAX_WIDTH = maxWidth;
					var MAX_HEIGHT = maxHeight;
					var width = img.width;
					var height = img.height;
					if (width > height) {
						if (width > MAX_WIDTH) {
							height *= MAX_WIDTH / width;
							width = MAX_WIDTH;
						}
					} else {
						if (height > MAX_HEIGHT) {
							width *= MAX_HEIGHT / height;
							height = MAX_HEIGHT;
						}
					}
					canvas.width = width;
					canvas.height = height;
					var ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0, width, height);
					var dataurl = canvas.toDataURL("image/png");

					if(typeof(callback)=='function')
						callback(dataurl);
				}
				img.src = imageData;
			}


			elem.bind('click', function(e){
				//At some point, this may end up being a call to open a modal which links to the media list
				$(elem).children('input')[0].click()
			});

			elem.bind('change', function(e) {
				var file, name, reader, size, type;
				if (e != null) {
					e.preventDefault();
				}
				file = e.target.files[0];
				if(file){
					name = file.name;
					type = file.type;
					size = file.size;
					reader = new FileReader();
					reader.onload = function(evt) {
						if(attrs.maxHeight || attrs.maxWidth){
							resizeImage(evt.target.result, attrs.maxHeight, attrs.maxWidth, function(newImage){
								scope.callback(file,newImage)
							})
						}else{
							scope.callback(file,evt.target.result)
						}
					};
					reader.readAsDataURL(file);
				}
				return false;
			});
			elem.bind('dragover', processDragOverOrEnter);
			elem.bind('dragenter', processDragOverOrEnter);
			return elem.bind('drop', function(event) {
				var file, name, reader, size, type;
				if (event != null) {
					event.preventDefault();
				}
				file = event.originalEvent.dataTransfer.files[0];
				name = file.name;
				type = file.type;
				size = file.size;
				reader = new FileReader();
				reader.onload = function(evt) {
					if(attrs.maxHeight || attrs.maxWidth){
						resizeImage(evt.target.result, attrs.maxHeight, attrs.maxWidth, function(newImage){
							scope.callback(file,newImage)
						})
					}else{
						scope.callback(file,evt.target.result)
					}
				};
				reader.readAsDataURL(file);
				return false;
			});
		}
	};
});




app.directive('slider', function ($timeout) {
  return {
    restrict: 'AE',
	replace: true,
	scope:{
		images: '='
	},
    link: function (scope, elem, attrs) {
	
		scope.currentIndex=0;

		scope.next=function(){
			scope.currentIndex<scope.images.length-1?scope.currentIndex++:scope.currentIndex=0;
		};
		
		scope.prev=function(){
			scope.currentIndex>0?scope.currentIndex--:scope.currentIndex=scope.images.length-1;
		};
		
		scope.$watch('currentIndex',function(){
			scope.images.forEach(function(image){
				image.visible=false;
			});
			scope.images[scope.currentIndex].visible=true;
		});
		
		/* Start: For Automatic slideshow*/
		
		var timer;
		
		var sliderFunc=function(){
			timer=$timeout(function(){
				scope.next();
				timer=$timeout(sliderFunc,5000);
			},5000);
		};
		
		sliderFunc();
		
		scope.$on('$destroy',function(){
			$timeout.cancel(timer);
		});
		
		/* End : For Automatic slideshow*/
		
    },
	templateUrl:'partials/site/sliderTemplate.html'
  }
});