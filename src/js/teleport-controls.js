/**
 * Teleport controls for mouse clicks.
 * uncomplete implementation for hand controls teleportation
 * use a-frame teleport controls instead.
 */


// To avoid recalculation at every mouse movement tick


(function (root, factory) {

    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([
			'./jquery-3.1.1.min.js', 
			], 
			factory);
	};

}(this, function ( $ ) { 'use strict';

	AFRAME.registerComponent('pik-teleport-controls', {

		schema: {

		},
		THREE : AFRAME.THREE,

		utils : AFRAME.utils,
		bind : AFRAME.utils.bind,
		raycaster : new THREE.Raycaster(),
		mouse : { x:0, y:0 },
		mouseActual: { x:0, y:0 },
		teleportCuror : null,
		initialMousePos : null,
		willTeleport : false,
		cursorHidden : false,
		threshold : 4, // How far the mouse can move with the mouse down before cacneling the teleport on mouse up.
		vrMode : false,
		model : "src/assets/models/pointer.gltf",

		init : function(){

			var self = this;
			var teleportTargets = document.getElementsByClassName('teleport-target');
			var scene = document.querySelector('a-scene');

			for ( var i=0; i<teleportTargets.length; i++ ){

				this.mousedown = this.bind(this.mousedown, this);
				this.mouseup = this.bind(this.mouseup, this);
				teleportTargets[i].addEventListener ( 'mousedown', this.mousedown);
				teleportTargets[i].addEventListener ( 'mouseup', this.mouseup);

			}

			if ( $('a-scene')[0].isMobile ){

				var threshold = 30;
				$('a-scene').on('touchstart', function(e){

					if (e.originalEvent){
						if (e.originalEvent.touches){
							self.mouse.x = e.originalEvent.touches[0].screenX;
							self.mouse.y = e.originalEvent.touches[0].screenY;
						}else{
							self.mouse.x = e.originalEvent.pageX;
							self.mouse.y = e.originalEvent.pageY
						}
					}else{

						self.mouse.x = 0;
						self.mouse.y = 0;

					}

				});
				$('a-scene').on('touchmove', function(e){

					if (!self.willTeleport)
						return;

					var x = self.mouse.x - (e.originalEvent.pageX || e.originalEvent.touches[0].screenX);
					var y = self.mouse.y - (e.originalEvent.pageY || e.originalEvent.touches[0].screenY);

					if (x*x + y*y > threshold*threshold){

						self.willTeleport = false;
						self.teleportCuror.setAttribute('visible', 'false');
						console.log("Out of threshold");

					}

				});

			}else {

				this.mousemove = this.bind(this.mousemove, this);
				scene.addEventListener( 'mousemove', this.mousemove );

			}

			this.createTeleportCursor();

			document.querySelector('a-scene').addEventListener('enter-vr', function () {

				self.vrMode = true;

			});

			document.querySelector('a-scene').addEventListener('exit-vr', function () {

				self.vrMode = false;

			});

		},

		clearListeners: function () {

			var teleportTargets = document.getElementsByClassName('teleport-target');
			var scene = document.querySelector('a-scene');

			for ( var i=0; i<teleportTargets.length; i++ ){

				teleportTargets[i].removeEventListener ( 'mousedown', this.mousedown);
				teleportTargets[i].removeEventListener ( 'mouseup', this.mouseup);

			}

			scene.removeEventListener( 'mousemove', this.mousemove );

		},

		mousemove: function (e) {

			// This needs changing incase there is more than 1 canvas.
			var canvas = document.querySelector('.a-canvas');
			var rect = canvas.getBoundingClientRect();
			this.mouseActual.x = e.clientX - rect.x;
			this.mouseActual.y = e.clientY - rect.y;
			this.mouse.x = ( (this.mouseActual.x) / rect.width ) * 2 - 1;
			this.mouse.y = - ( (this.mouseActual.y) / rect.height ) * 2 + 1;

			if ( this.initialMousePos ){

				var dx = this.mouseActual.x - this.initialMousePos.x
				var dy = this.mouseActual.y - this.initialMousePos.y;
				var dist = Math.sqrt(dx*dx + dy*dy);

				if (dist > this.threshold){

					this.willTeleport = false;

				}

			}

		},

		update: function (oldData) {

			var data = this.data;

			if ( data.cursorHidden != oldData.cursorHidden ){

				this.cursorHidden = data.cursorHidden;
				this.teleportCuror.setAttribute('visible', !data.cursorHidden);

			}

		},

		mouseup: function () {

			if ( this.willTeleport ){

				var teleportObjectEl = $('.teleport-object')[0];
				var teleportPosition = this.teleportCuror.getAttribute('position');

				var teleportCompleted = function(){

					teleportObjectEl.removeAttribute('animation__teleport');

				};

				teleportObjectEl.setAttribute('animation__teleport', 
				'property:position;\
				dur:100;\
				to:' + teleportPosition.x + ' ' + teleportPosition.y + ' ' + teleportPosition.z + ';\
				startEvents:teleportAnim;');
				teleportObjectEl.teleportCompleted = teleportCompleted;
				teleportObjectEl.emit('teleportAnim');

				// var posAnim = document.createElement('a-animation');
				// posAnim.setAttribute('attribute', 'position');
				// posAnim.setAttribute('fill', 'forwards');
				// posAnim.setAttribute('to', teleportPosition.x + ' ' + teleportPosition.y + ' ' + teleportPosition.z);
				// posAnim.setAttribute('begin', 'teleport'); // Hack to prevent teleportation when switching back to this camera
				// console.log('Teleport pos: ' + teleportPosition.x + ' ' + teleportPosition.y + ' ' + teleportPosition.z);
				// There's a bug where the animation stays here even when removed and get's executed automatically.
				//posAnim.setAttribute('dur', 100);
				// $('.teleport-object').append(posAnim);
				// $('.teleport-object')[0].emit('teleport');
				// $('.paint-menu').attr('visible', 'false');
				// $('.open-anim-help').attr('visible', 'false');

				//posAnim.addEventListener('animationend', animationend);
				this.willTeleport = false;

			}

			this.initialMousePos = false;

		},

		mousedown: function (e) {

			if ( $('a-scene')[0].isMobile && !this.vrMode ){

				this.willTeleport = true;

				var point = e.detail.intersection.point;

				this.teleportCuror.setAttribute('position', 
					point.x + ' ' + 
					point.y + ' ' + 
					point.z);

				this.teleportCuror.setAttribute('visible', 'true');

				return;

			}else if ($('a-scene')[0].isMobile){

				return;

			};

			this.initialMousePos = { x:this.mouseActual.x, y:this.mouseActual.y };

			if ( this.teleportCuror.getAttribute('visible') ){

				this.willTeleport = true;

			}else {

				this.willTeleport = false;

			}

		},

		remove: function () {
			
			this.teleportCuror.parentEl.removeChild(this.teleportCuror);
			this.clearListeners();

		},

		createTeleportCursor : function() {

			var scene;

			if (this.model){

				this.teleportCuror = document.createElement('a-entity');
				this.teleportCuror.setAttribute('gltf-model', this.model);
				this.teleportCuror.setAttribute('scale', '0.02 0.02 0.02');
				this.teleportCuror.setAttribute('animation__rot', 
					'property:rotation;\
					easing: linear;\
					dur: 8000;\
					to: "0 360 0";\
					loop:true');

			}else{

				this.teleportCuror = document.createElement('a-ring');

				if ($('a-scene')[0].isMobile){

					this.teleportCuror.setAttribute('radius-inner', '0.21');
					this.teleportCuror.setAttribute('radius-outer', '0.3');

				}else{

					this.teleportCuror.setAttribute('radius-inner', '0.07');
					this.teleportCuror.setAttribute('radius-outer', '0.1');

				}
				this.teleportCuror.setAttribute('material', 'shader: flat; color: green;');
				this.teleportCuror.setAttribute('rotation', '-90 0 0');
				
				// This needs changing incase there's more than 1 scene.
			}

			scene = document.querySelector('a-scene');
			scene.append(this.teleportCuror);

		},

		traverseObjectForGeometry : function ( object ) {

			var meshes = [];

			if ( object.children )
				if ( object.children.length > 0 )
					for ( var i=0; i<object.children.length; i++) {
						meshes = meshes.concat(this.traverseObjectForGeometry (object.children[i]));
					}

			if ( object.geometry )
				meshes.push(object);

			return meshes;

		},

		tick : function () {

			if ( $('a-scene')[0].isMobile ){

				return;

			}

			var targets = [];
			var meshes, intersects, camera;
			for (var i=0; i<$('.teleport-target').length; i++){

				meshes = this.traverseObjectForGeometry($('.teleport-target')[i].object3D);
				targets = targets.concat(meshes);

			}

			for (var i=0; i<$('.hitbox').length; i++){

				meshes = this.traverseObjectForGeometry($('.hitbox')[i].object3D);
				for (var j=0; j<meshes.length; j++){

					meshes[j].hitbox = true;

				}
				targets = targets.concat(meshes);

			}

			camera = document.querySelector('a-camera');
			this.raycaster.setFromCamera( this.mouse, camera.object3D.children[0] );
			intersects = this.raycaster.intersectObjects( targets );

			if (intersects.length > 0 && !intersects[0].object.hitbox && !this.cursorHidden){

				this.teleportCuror.setAttribute('position', 
					intersects[0].point.x + ' ' + 
					intersects[0].point.y + ' ' + 
					intersects[0].point.z);

				if (this.teleportCuror.getAttribute('visible') == false){
					this.teleportCuror.setAttribute('visible', true);
				}

			}else{

				this.teleportCuror.setAttribute('visible', false);

			}

		}

	});


}));