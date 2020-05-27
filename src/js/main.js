(function (root, factory) {

    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([
			'./a-frame.js', 
			'./jquery-3.1.1.min.js', 
			'./GLTFLoader.js', 
			'./loaders/DRACOLoader.js', 
			'./aframe-cubemap-component.js',
			'./aframe-animation-component.js',
			'./teleport-controls.js',
			'./pik-look-controls.js',
			'./aframe-teleport-controls.js',
			'./a-frame-cube-env-map.js',
			'./aframe-template-component.js',
			'./aframe-gltf-material-changer.js',
			'./aframe-gltf-material-changer-2.js',
			'./aframe-gltf-material-upres.js',
			'./aframe-gltf-model-draco.js',
			'./aframe-orbit-controls-component.min.js',
			'./aframe-look-at-component.js',
			'./aframe-info-bubble.js'
			], 
			factory);
	};

}(this, function ( AFRAME, $ ) { 'use strict';

	AFRAME.registerComponent('main', {
		dependencies: [],
		schema: {},
		savedCamera:{},
		orbiting:false,
		teleportEnabled:true,
		isMobile:false,
		AnimationSequence:null,
		orientationchange:null,
		debug:true,
		originalCamPos:true,
		animTourShown:false,
		animHelpHidden:true,
		vrMode:false,
		loadingHTML:
			'<a-sphere side="2" material="shader: flat; color: black; side:back; transparent:true;" class="loading" radius="0.2" position="0 0 0">\
				<a-animation begin="0" fill="forwards" repeat="0" direction="normal" attribute="material.opacity" from="0" to="1" dur="1000"></a-animation>\
				<a-animation begin="fadeout" fill="forwards" repeat="0" direction="normal" attribute="material.opacity" from="1" to="0" dur="1000"></a-animation>\
				<a-entity class="loading-img" geometry="primitive: plane; height: 0.01; width: 0.01"\
					material="shader: flat; src:#loading-img; transparent:true;" position="0 0 -0.1">\
					<a-animation begin="0" fill="forwards" repeat="indefinite" direction="normal" easing="linear" attribute="rotation" from="0 0 0" to="0 0 360" dur="3000"></a-animation>\
					<a-animation begin="0" fill="forwards" repeat="0" direction="normal" attribute="material.opacity" from="0" to="1" dur="1000"></a-animation>\
					<a-animation begin="fadeout" fill="forwards" repeat="0" direction="normal" attribute="material.opacity" from="1" to="0" dur="1000"></a-animation>\
				</a-entity>\
			</a-sphere>',
		hotspotData: {	
			'lamp':{
				'camera':{	
					"position":"0.4119 1.04 -4.45409",	
					"pitch":-30,	
					"yaw":0,	
					"radius":1.5,	
					"minAzimuthAngle":-Infinity,	
					"maxAzimuthAngle":Infinity,	
					"minPolarAngle":0,	
					"maxPolarAngle":Math.PI	
				}
			},	

			'sink':{
				'camera':{	
					"position":"-1.0 0 -1.03",	
					"pitch":-30,	
					"yaw":90,	
					"radius":1.1,	
					"minAzimuthAngle":-Infinity,	
					"maxAzimuthAngle":Infinity,	
					"minPolarAngle":0,	
					"maxPolarAngle":Math.PI	
				}
			},
			'cornice':{
				'camera':{	
					'position':'-1.79 1.1 1.78',	
					'pitch':0,	
					'yaw':40,
					"radius":1,	
					"minAzimuthAngle":-Infinity,	
					"maxAzimuthAngle":Infinity,	
					"minPolarAngle":0,
					"maxPolarAngle":Math.PI	
				}
			},	
			'hood-moulding':{
				'camera':{	
					"position":"-1.66 2.017 -2.051",	
					"pitch":-9,	
					"yaw":50,	
					"radius":1,	
					"minAzimuthAngle":-Infinity,	
					"maxAzimuthAngle":Infinity,	
					"minPolarAngle":0,	
					"maxPolarAngle":Math.PI	
				}
			},	
			'unit-door':{
				'camera':{	
					"position":"1.76 0.235 -1.101",	
					"pitch":-2.98,	
					"yaw":-0.53,	
					"radius":1.8,	
					"minAzimuthAngle":-Infinity,	
					"maxAzimuthAngle":Infinity,	
					"minPolarAngle":0,	
					"maxPolarAngle":Math.PI	
				},
			},	
			'table':{
				'camera':{	
					"position":"0.371 -0.286 2.964",	
					"pitch":-30,	
					"yaw":180,	
					"radius":1.5,	
					"minAzimuthAngle":-Infinity,	
					"maxAzimuthAngle":Infinity,	
					"minPolarAngle":0,	
					"maxPolarAngle":Math.PI	
				}
			},	
			'cooker':{
				'camera':{	
					"position":"0.273 -0.28 -1.376",	
					"pitch":-30,	
					"yaw":0,	
					"radius":1.5,	
					"minAzimuthAngle":-Infinity,	
					"maxAzimuthAngle":Infinity,	
					"minPolarAngle":0,	
					"maxPolarAngle":Math.PI	
				}
			},	
			'stool':{
				'camera':{	
					"position":"1.573 -0.23 2.787",	
					"pitch":-20,	
					"yaw":50,	
					"radius":1.3,	
					"minAzimuthAngle":-Infinity,	
					"maxAzimuthAngle":Infinity,	
					"minPolarAngle":0,	
					"maxPolarAngle":Math.PI	
				}
			},	
			'tap':{	
				'camera':{	
					"position":"-0.013 -0.372 -1.878",	
					"pitch":0,	
					"yaw":180,	
					"radius":1,	
					"minAzimuthAngle":-Infinity,	
					"maxAzimuthAngle":Infinity,	
					"minPolarAngle":0,	
					"maxPolarAngle":Math.PI	
				}
			}	
		},

		init: function () {

			var self = this;

			// Wait for scene to be loaded first else we have problems.
			$('a-scene')[0].addEventListener('loaded', function(){

				if (self.debug) console.log("Initialising kitchen.js");

				// Begin animated tour.
				self.AnimationSequence = self.animationSequence();

				self.generalListeners();

				// Hide hotsots and vr button to begin with.
				$('.hotspot').attr('visible', false);
				$('.a-enter-vr').css('display', 'none');

				if ( $('a-scene')[0].isMobile ){

					self.mobileInit();

				}else{

					self.desktopInit();

				}
				//animationSequence.start();

				self.setDepthTests();

			});

			// Select default paint value in ui
			$('.opt1').children('.paint').addClass('selected'); // Flag this element as selected for further reference
			$('.opt1').children('a-ring')[0].setAttribute('material', 'color:#ffffff');
			$('.opt2').children('a-ring')[0].setAttribute('material', 'color:#000000');
			$('.opt3').children('a-ring')[0].setAttribute('material', 'color:#000000');

		},

		setDepthTests:function () {

			var btn, text;
			var btns = $('.vrbtn');
			var texts = $('a-text');

			for ( var i=0; i<btns.length; i++ ){

				btn = btns[i];
				// Check for depth test flag, if it's on then we want this one depth tested
				// So leave the btn depth test as true and set the ring depth test to true
				// which is set to false in the html.
				if(btn.parentNode.dataset.depthtest != "true"){
					btn.object3D.children[0].material.depthTest = false;
				}else{
					btn.object3D.children[0].material.depthTest = true;
				}

			}

			for ( var i=0; i<texts.length; i++ ){

				text = texts[i];
				text.object3D.children[0].material.depthTest = false;

			}

		},

		teleportObjectAnimationComplete:function (e) {

			if(e.detail.name == "animation__pos" && this.posCompleted){

				this.posCompleted();

			}

		},

		cameraAnimationComplete:function (e){

			if (e.detail.name == 'animation__yaw' && this.yawCompleted ){
				
				this.yawCompleted();

			}else if (e.detail.name == 'animation__pitch' && this.pitchCompleted ){

				this.pitchCompleted();

			}

		},

		animationSequence:function () {

			var self = this;

			this.flyOverAnim = null;
			this.pivotAnim = null; 
			this.flyDownAnim = null;
			this.flyByWorktopAnim = null;
			this.lookDownAnim = null;

			this.stop = function () {

				$('#cameraRig')[0].emit('stop-fly-over');
				$('#cameraRig')[0].emit('stop-fly-down');
				$('#cameraRig')[0].emit('stop-fly-by-worktop');
				$('#cameraRig')[0].emit('stop-look-down');
				$('#camera')[0].emit('stop-pivot');

				this.removeEventListeners();

			};

			this.removeEventListeners = function () {

				this.flyOverAnim.removeEventListener('animationend', flyOverEnd);
				this.pivotAnim.removeEventListener('animationend', pivotEnd);
				this.flyDownAnim.removeEventListener('animationend', flyDownEnd);
				this.flyByWorktopAnim.removeEventListener('animationend', flyByWorktopEnd);
				this.lookDownAnim.removeEventListeners('animationend', lookDownEnd);

			};

			this.addEventListeners = function () {

				this.flyOverAnim.addEventListener('animationend', flyOverEnd);
				this.pivotAnim.addEventListener('animationend', pivotEnd);
				this.flyDownAnim.addEventListener('animationend', flyDownEnd);
				this.flyByWorktopAnim.addEventListener('animationend', flyByWorktopEnd);
				this.lookDownAnim.addEventListener('animationend', lookDownEnd);
				$('.teleport-object')[0].addEventListener('animationcomplete', this.teleportObjectAnimationComplete);	
				$('#camera')[0].addEventListener('animationcomplete', this.cameraAnimationComplete);

			};

			this.init = function () {

				this.flyOverAnim = document.createElement('a-animation');
				this.flyOverAnim.setAttribute('attribute', 'position');
				this.flyOverAnim.setAttribute('dur', '15000');
				this.flyOverAnim.setAttribute('begin', 'fly-over');
				this.flyOverAnim.setAttribute('end', 'stop-fly-over');
				this.flyOverAnim.setAttribute('easing', 'ease-out-cubic');
				this.flyOverAnim.setAttribute('from', '-0.026 -0.3 -0.423');
				this.flyOverAnim.setAttribute('to', '2.267 -0.3 2.957');
				

				this.pivotAnim = document.createElement('a-animation');
				this.pivotAnim.setAttribute('attribute', 'pik-look-controls.yaw');
				this.pivotAnim.setAttribute('dur', '15000');
				this.pivotAnim.setAttribute('begin', 'pivot');
				this.pivotAnim.setAttribute('end', 'stop-pivot');
				this.pivotAnim.setAttribute('easing', 'linear');
				this.pivotAnim.setAttribute('from', '-60');
				this.pivotAnim.setAttribute('to', '0');
				

				this.flyDownAnim = document.createElement('a-animation');
				this.flyDownAnim.setAttribute('attribute', 'position');
				this.flyDownAnim.setAttribute('dur', '10000');
				this.flyDownAnim.setAttribute('begin', 'fly-down');
				this.flyDownAnim.setAttribute('end', 'stop-fly-down');
				this.flyDownAnim.setAttribute('easing', 'linear');
				this.flyDownAnim.setAttribute('from', '-1 0.3 0');
				this.flyDownAnim.setAttribute('to', '-1 -0.8 0');
				

				this.flyByWorktopAnim = document.createElement('a-animation');
				this.flyByWorktopAnim.setAttribute('attribute', 'position');
				this.flyByWorktopAnim.setAttribute('dur', '10000');
				this.flyByWorktopAnim.setAttribute('begin', 'fly-by-worktop');
				this.flyByWorktopAnim.setAttribute('end', 'stop-fly-by-worktop');
				this.flyByWorktopAnim.setAttribute('easing', 'linear');
				this.flyByWorktopAnim.setAttribute('from', '2.051 -0.5 2.221');
				this.flyByWorktopAnim.setAttribute('to', '2.051 -0.5 -1.675');

				this.lookDownAnim = document.createElement('a-animation');
				this.lookDownAnim.setAttribute('attribute', 'position');
				this.lookDownAnim.setAttribute('dur', '10000');
				this.lookDownAnim.setAttribute('begin', 'look-down');
				this.lookDownAnim.setAttribute('end', 'stop-look-down');
				this.lookDownAnim.setAttribute('easing', 'linear');
				this.lookDownAnim.setAttribute('from', '-0.329 0.3 4.683');
				this.lookDownAnim.setAttribute('to', '-0.329 0.3 -0.581');
				

				$('#camera').append(this.pivotAnim);
				$('#cameraRig').append(this.flyOverAnim);
				$('#cameraRig').append(this.flyDownAnim);
				$('#cameraRig').append(this.flyByWorktopAnim);
				$('#cameraRig').append(this.lookDownAnim);

			};

			this.setEnvMap = function (object, path, intensity) {

				intensity = intensity || 1;

				var format = '.jpg';
				var envMap = new THREE.CubeTextureLoader().load( [
					path + 'posx' + format, path + 'negx' + format,
					path + 'posy' + format, path + 'negy' + format,
					path + 'posz' + format, path + 'negz' + format
				] );

				object.traverse( function ( child ) {

					if ( child.isMesh ) {

						child.material.envMap = envMap;
						child.material.envMapIntensity = intensity;
						child.material.needsUpdate = true;

					}

				});

			};

			this.start = function () {

				$('#cameraRig')[0].emit('fly-over');
				self.fadeOverlay(15000 - 1000);
				self.fadeOverlay(1);
				camera.setAttribute('pik-look-controls', 'yaw', '30');
				camera.setAttribute('pik-look-controls', 'pitch', '0');

				self.addEventListeners();

			};

			var camera = document.getElementById('camera');

			var lookDownEnd = function () {

				self.removeEventListeners();
				self.start(); // Restart animation

			};


			var pivotEnd = function () {

				$('#cameraRig')[0].emit('look-down');
				self.fadeOutOverlay(10000 - 1000);
				camera.setAttribute('pik-look-controls', 'yaw', '0');
				camera.setAttribute('pik-look-controls', 'pitch', '-90');

			};

			var flyDownEnd = function () {

				$('#camera')[0].emit('pivot');
				camera.setAttribute('pik-look-controls', 'pitch', '0');
				$('#cameraRig').attr('position', '-1.764 -0.2 5.142');
					
				self.fadeOverlay(14000);

			};

			var flyByWorktopEnd = function () {

				$('#cameraRig')[0].emit('fly-down');
				camera.setAttribute('pik-look-controls', 'yaw', '0');
				camera.setAttribute('pik-look-controls', 'pitch', '0');
				self.fadeOverlay(10000 - 1000);

			};

			var flyOverEnd = function () {

				$('#cameraRig')[0].emit('fly-by-worktop');
				self.fadeOverlay(10000 - 1000);
				camera.setAttribute('pik-look-controls', 'yaw', '90');
				camera.setAttribute('pik-look-controls', 'pitch', '0');

			};

			this.init();
			return this;

		},

		fadeInOverlayLong:function ( delay ) {

			$('.overlay').removeClass('opaque');
			$('.overlay').removeClass('transparent');
			$('.overlay').removeClass('transparentLong');
			self.fadeTimeout = setTimeout(function(){
				$('.overlay').addClass('transparentLong');
			}, delay);

		},

		fadeOutOverlay:function ( delay ) {

			self.fadeTimeout = setTimeout(function(){

				$('.overlay').removeClass('opaque');
				$('.overlay').removeClass('transparent');
				$('.overlay').removeClass('transparentLong');
				$('.overlay').addClass('opaque');

			}, delay);

		},

		fadeOverlay:function ( delay ) {

			self.fadeTimeout = setTimeout(function(){

				$('.overlay').removeClass('opaque');
				$('.overlay').removeClass('transparent');
				$('.overlay').removeClass('transparentLong');

				$('.overlay').addClass('opaque');
				setTimeout(function(){
					$('.overlay').addClass('transparent');
				}, 1000);

			}, delay);

		},

		cancelAnimationSequence:function () {

			clearTimeout(self.fadeTimeout);
			$('#cameraRig a-animation').remove();
			$('#camera a-animation').remove();

		},

		mobileInit:function () {

			this.isMobile = true;
			this.setMobileListeners();

		},

		setMobileListeners:function () {

			var threshold = 4;
			var activeMaterial = 0;
			var willTap = false;
			var pos = {};
			var self = this;

			$('a-scene').on('touchstart', function(e){

				willTap = true;
				if (e.originalEvent){
					if (e.originalEvent.touches){
						pos.x = e.originalEvent.touches[0].screenX;
						pos.y = e.originalEvent.touches[0].screenY;
					}else{
						pos.x = e.originalEvent.pageX;
						pos.y = e.originalEvent.pageY
					}
				}else{

					pos.x = 0;
					pos.y = 0;

				}
				

			});

			$('a-scene').on('touchmove', function(e){

				var x,y;

				if (e.originalEvent){
					if (e.originalEvent.touches){
						x = pos.x - e.originalEvent.touches[0].screenX;
						y = pos.y - e.originalEvent.touches[0].screenY;
					}else{
						x = pos.x - e.originalEvent.pageX;
						y = pos.y - e.originalEvent.pageY
					}
				}else{

					pos.x = 0;
					pos.y = 0;

				}

				if (x*x + y*y > threshold*threshold){

					willTap = false;

				}

			});

			$('.open-anim-help').on('mouseup', function(e){

				self.openAnimHelpClick(e, this);

			});

			$('.hotspot .button').on('mouseup', function(e){

				if (!willTap) return;
				self.hotspotClick(this, self);

			});

			$('.animated-model').on('mouseup', function(e, d){

				if (!willTap) return;
				self.animatedModelClick(this, self);


			});

			$('.open-paint').on('mouseup', function(e){

				if (!willTap) return;
				self.openPaintClick(e, this);

			});

			$('.paint').on('mouseup', function(e){

				if (!willTap) return;
				self.paintClick(e, this);

			});

		},

		animatedModelClick:function( el, self ){

			if(!self.animHelpHidden) self.hideAnimationHelp();
			if ( $(el).hasClass('open') ){

				$(el).removeClass('open');
				$(el).addClass('close');
				el.emit('close');

			}else{

				$(el).removeClass('close');
				$(el).addClass('open');
				el.emit('open');

			}

		},

		animateCameraTo:function ( camera, duration, completed ) {

			duration = duration * 1000 || 1000;	

			var posAnim, yawAnim, pitchAnim, rotation, initialPitch, initialYaw, yawCompleted, 
				pitchCompleted, posCompleted;
			var cameraEl = $('#camera')[0];
			var self = this;

			if (this.debug) console.log("Animating camera to postion");	

			// Remove any residual animations	
			$('.yaw-anim').remove();	
			$('.pitch-anim').remove();	
			$('.pos-anim').remove();

			cameraEl.setAttribute('pik-look-controls', 'hmdEnabled', 'false'); // Disable gyros so as not to mess with the animation	
			
			yawCompleted = function () {

				cameraEl.setAttribute('pik-look-controls', 'hmdEnabled', 'true'); // Can re-enable gyros now	
				cameraEl.removeAttribute('animation__yaw');
				if ( camera.radius ){
					self.switchToOrbit(camera);
				}

			};

			pitchCompleted = function () {

				cameraEl.removeAttribute('animation__pitch');

			};

			if (camera.position){	

				$('.teleport-object')[0].setAttribute('animation__pos', 
					'property:position;\
					easing:easeInOutQuad;\
					dur:' + duration + ';\
					to:' + camera.position + ';\
					startEvents:posAnim');
				$('.teleport-object')[0].posCompleted = completed;
				$('.teleport-object')[0].emit('posAnim');

			}	

			// Stop over rotation, you should never rotate more tahn 180 degrees	
			rotation = cameraEl.getObject3D('camera').parent.rotation;	
			initialPitch = rotation.x * 180/Math.PI; // Convert to degrees
			while ( camera.pitch - initialPitch > 180 ){	
				camera.pitch -= 360;	
			}	
			while ( camera.pitch - initialPitch < -180 ){	
				camera.pitch += 360;	
			}	

			cameraEl.setAttribute('animation__pitch', 
				'property:pik-look-controls.pitch;\
				easing:easeInOutQuad;\
				dur:' + duration + ';\
				from:' + initialPitch + ';\
				to:' + camera.pitch + ';\
				startEvents:pitchAnim;');
			cameraEl.pitchCompleted = pitchCompleted;
			cameraEl.emit('pitchAnim');

			rotation = cameraEl.getObject3D('camera').parent.rotation;	
			initialYaw = rotation.y * 180/Math.PI; // Convert to degrees	
			while ( camera.yaw - initialYaw > 180 ){	
				camera.yaw -= 360;	
			}	
			while ( camera.yaw - initialYaw < -180 ){	
				camera.yaw += 360;	
			}	

			cameraEl.setAttribute('animation__yaw', 
				'property:pik-look-controls.yaw;\
				easing:easeInOutQuad;\
				dur:' + duration + ';\
				from:' + initialYaw + ';\
				to:' + camera.yaw + ';\
				startEvents:yawAnim;');
			cameraEl.yawCompleted = yawCompleted;
			cameraEl.emit('yawAnim');

		},

		setCameraRotation:function ( rotation ) {	
			// You can work out what rotation to set by using - $('#camera')[0].getObject3D('camera').parent.rotation	
			$('#camera')[0].components['pik-look-controls'].pitchObject.rotation._x = rotation.x;	
			$('#camera')[0].components['pik-look-controls'].yawObject.rotation._y = rotation.y;	
			// Don't want to touch the z axis, this is for roll and not usefull unless you're flying a plane.	
		},

		paintClick:function (e, el) {

			var quality = $('a-scene')[0].isMobile ? "medium" : "high";

			var materials = [
				'src/assets/materials/' + quality + '/MAP_04_[Island_Units_Green]_baseColor.jpg',
				'src/assets/materials/' + quality + '/MAP_04_[Island_Units_Blue]_baseColor.jpg',
				'src/assets/materials/' + quality + '/MAP_04_[Island_Units_Grey]_baseColor.jpg',
			];
			var materials2 = [
				'src/assets/materials/' + quality + '/MAT_15_[Drawer_Interiors]_baseColor.jpg',
				'src/assets/materials/' + quality + '/MAT_15_[Drawer_Interiors_Blue]_baseColor.jpg',
				'src/assets/materials/' + quality + '/MAT_15_[Drawer_Interiors_Yellow]_baseColor.jpg',
			];

			$('.paint.selected').parent().children('a-ring')[0].emit('unselect');
			$('.paint').removeClass('selected');
			$(el).addClass('selected'); // Flag this element as selected for further reference
			$(el).parent().children('a-ring')[0].emit('select');

			if ($(el).parent().hasClass('opt1')){

				document.querySelector('a-scene').systems['gltf-material-changer'].updateMaterial(materials[0]);
				document.querySelector('a-scene').systems['gltf-material-changer-2'].updateMaterial(materials2[0]);

			}else if ($(el).parent().hasClass('opt2')){

				document.querySelector('a-scene').systems['gltf-material-changer'].updateMaterial(materials[1]);
				document.querySelector('a-scene').systems['gltf-material-changer-2'].updateMaterial(materials2[1]);

			}else if ($(el).parent().hasClass('opt3')){

				document.querySelector('a-scene').systems['gltf-material-changer'].updateMaterial(materials[2]);
				document.querySelector('a-scene').systems['gltf-material-changer-2'].updateMaterial(materials2[2]);

			}

		},

		switchToLook:function () {	

			var camPos = new THREE.Vector3();	
			var camQuat = new THREE.Quaternion();	
			var camRot = $('#orbit-camera')[0].object3D.rotation;	
			var yaw = camRot.y * 180/Math.PI;	
			var pitch = camRot.x * 180/Math.PI;	
			var y;
			
			$('.cursor').attr('pik-teleport-controls', '');	
			this.teleportEnabled = true;	
			$('#orbit-camera')[0].object3D.getWorldPosition(camPos);	
			y = camPos.y - 1.6; // Don't include the camera height which is 1.6	
			$('#camera').attr( 'camera', 'active:true;');	
			$('.teleport-object').attr('position', camPos.x + ' ' + y + ' ' + camPos.z);	
			$('#camera').attr('pik-look-controls', 'pitch:' + pitch);	
			$('#camera').attr('pik-look-controls', 'yaw:' + yaw);	
			$('#orbit-camera').remove();
			$('.hotspot').attr('look-at', '[camera]');

		},

		switchToOrbit:function ( camera ) {
			
			var targetPos;
			var camPos = new THREE.Vector3();	
			var camDir = new THREE.Vector3();	
			var orbitCamEl = document.createElement('a-camera');
			var orbitTarget = $('#orbit-target')[0];
			var cursor = $('.cursor');
			var cameraEl = $('#camera')[0];
			var scene = $('a-scene');

			this.teleportEnabled = false;	

			cursor.removeAttr('pik-teleport-controls');	

			orbitCamEl.id = 'orbit-camera';
			orbitCamEl.setAttribute('orbit-controls', 'enabled:true;enableRotate:true;autoRotate: false;target: #orbit-target;enableDamping: true;dampingFactor: 0.125;rotateSpeed:0.25;minDistance:0;maxDistance:100;minAzimuthAngle:' + camera.minAzimuthAngle +	
				';maxAzimuthAngle:' + camera.maxAzimuthAngle +	
				';minPolarAngle:' + camera.minPolarAngle +	
				';maxPolarAngle:' + camera.maxPolarAngle);	
			cameraEl.object3D.getWorldPosition(camPos);
			cameraEl.object3D.getWorldDirection(camDir);
			targetPos = {
				'x':camPos.x - camDir.x * camera.radius,
				'y':camPos.y - camDir.y * camera.radius,
				'z':camPos.z - camDir.z * camera.radius
			};
			orbitTarget.setAttribute( 'position', targetPos.x + ' ' + targetPos.y + ' ' + targetPos.z);	
			orbitCamEl.setAttribute( 'position', camPos.x + ' ' + camPos.y + ' ' + camPos.z );	
			scene.append(orbitCamEl);	

			orbitCamEl.setAttribute('camera', 'fov: 70; active:true;');
			// Wait 1 frame before setting look-at, give a-frame time to set the orbit camera position
			var count = 1;
			this.tockFunc = function(){

				if (count == 0){
				
					$('.hotspot').attr('look-at', '#orbit-camera');
					count = undefined;
					this.tockFunc = function(){};

				}
				count--;

			}
			
		},

		openPaintClick:function (e, el) {

			var btns = $('.vrbtn.paint');
			var overlaps =  $('.overlapper');

			el.querySelector('a-image').setAttribute('src','src/assets/images/paint.png'); // Change the icon

			if ($(el).hasClass('selected')){

				for (var i=btns.length-1; i>=0; i--){

					setTimeout(function(){

						btns[this].emit('hide');

					}.bind(i), (btns.length-i-1)*100);

				}

				$(el).removeClass('selected');

				for ( var i=0; i<overlaps.length; i++ ){

					if (overlaps[i] != el.parentNode)
						overlaps[i].emit('expand');

				}

			}else{

				el.querySelector('a-image').setAttribute('src','src/assets/images/close-2.png'); // Change the icon

				for (var i=0; i<btns.length; i++){

					setTimeout(function(){

						btns[this].emit('show');

					}.bind(i), i*100);

				}

				$(el).addClass('selected');

				// Hide other ui objects to prevent overlap
				for ( var i=0; i<overlaps.length; i++ ){

					if (overlaps[i] != el.parentNode)
						overlaps[i].emit('shrink');

				}

			}

		},

		openAnimHelpClick:function (e, el) {

			//$('.anim-tutorial').attr('visible', 'true');
			this.hideAnimationHelp();

			var animatedModels = $('.animated-model');

			var animateModel = function(mdl){

				mdl.emit('demo');

			};

			for (var i=0; i<animatedModels.length; i++){

				setTimeout(animateModel, 250*i, animatedModels[i] );

			}

		},

		desktopInit:function () {

			this.initDesktopListeners();
			$('.hotspot').attr('scale', '1 1 1');

		},

		removeOverlay:function () {

			$('.overlay').hide();

			// Put the UI back
			$('.hotspot').attr('visible', true);
			$('.a-enter-vr').css('display', 'block');
			$('.restart').show();

		},

		addOverlay:function () {

			$('.overlay').show();
			$('.hotspot').attr('visible', false);
			$('.a-enter-vr').hide();
			$('.restart').hide();

		},

		animateToStart:function () {

			$('#cameraRig')[0].emit('moveToStart');
			$('#camera')[0].emit('yawToStart');
			$('#camera')[0].emit('pitchToStart');

			$('.animateToStart')[0].addEventListener('animationend', this.animatedToStart);
			$('.cursor')[0].setAttribute('pik-teleport-controls', 'cursorHidden', false);
			$('.paint-menu').attr('visible', true);

			this.showAnimationHelp();

		},

		animatedToStart:function () {

			$('#camera').attr('pik-look-controls', 'hmdEnabled:true');
			$('.animateToStart')[0].removeEventListener('animationend', this.animatedToStart);

		},

		generalListeners:function () {

			var self = this;
			var gamePadCount = 0;

			window.addEventListener('orientationchange', function(e){

				orientationchange = e;

			});

			$('.restart').click(function(){

				if ($('#orbit-camera')[0]){
					self.switchToLook();
				};

				var hotspots = $('.hotspot');
				for ( var i=0; i<hotspots;i++ ){

					if (hotspots[i].hasClass('selected')){
						hotspotClick(hotspots[i], self);
					}

				}

				self.addOverlay();
				self.AnimationSequence.start();

				$('.module.viewer').removeClass('fullscreen');
				$('body').removeClass('noscroll');
				$('.paint-menu').attr('visible', 'false');
				$('.open-anim-help').attr('visible', 'false');

				var animatedModels = $('.animated-model');

				for (var i=0; i<animatedModels.length; i++){

					if ($(animatedModels[i]).hasClass('open')){
						animatedModels[i].emit('close');
						$(animatedModels[i]).removeClass('open');
						$(animatedModels[i]).addClass('close');
					}

				}
				$('.open-anim-help').attr('visible', false);
				$('.open-anim-help')[0].emit('expand');

			});

			$('.start.btn').click( function(){

				// A hack for android chrome, it's not negating the bar for 100vh.
				// var ua = navigator.userAgent.toLowerCase();
				// var isAndroid = ua.indexOf("android") > -1;
				// if(isAndroid && /Chrome/i.test(ua) && !AFRAME.utils.checkHeadsetConnected()) {
					document.getElementsByClassName('canvas-container')[0].style.height = $(window).height() + "px";
				//}

				$('.module.viewer').addClass('fullscreen');
				$('body').addClass('noscroll');

				setTimeout(function() { 

					$('a-scene')[0].resize();

				}, 1000);

				self.removeOverlay();
				self.AnimationSequence.stop();
				self.animateToStart();

				window.dispatchEvent(new Event('resize'));

			});

			document.querySelector('a-scene').addEventListener('enter-vr', function () {

				$('.restart').hide();

				self.vrMode = true;
				if (gamePadCount > 0){

					$('.cursor').removeAttr('pik-teleport-controls');

				}else{

					document.querySelectorAll('#hotspot-container')[0].setAttribute('visible','false');
					document.querySelectorAll('.open-anim-help')[0].setAttribute('visible','false');
					document.querySelectorAll('.paint-menu')[0].setAttribute('visible','false');

				}
				// hide our hotspots in vr mode
				//document.querySelectorAll('#hotspot-container')[0].setAttribute('visible','false');

				if ($('#orbit-camera')[0]){
					self.switchToLook();
				}

			});

			document.querySelector('a-scene').addEventListener('exit-vr', function () {

				$('.restart').show();
				self.vrMode = false;
				if ( self.teleportEnabled )
					$('.cursor')[0].setAttribute('pik-teleport-controls', 'cursorHidden', false);

				// when exiting reshow the hotspots
				//document.querySelectorAll('#hotspot-container')[0].setAttribute('visible','true');
				document.querySelectorAll('#hotspot-container')[0].setAttribute('visible','true');
				document.querySelectorAll('.open-anim-help')[0].setAttribute('visible','true');
				document.querySelectorAll('.paint-menu')[0].setAttribute('visible','true');
				// $('.a-canvas').removeAttr('style');

				location.reload();

			});

			window.addEventListener("gamepadconnected", function(e) {

				gamePadCount++;
				// Remove gaze controls
				if ( self.vrMode ){
					$('.cursor').removeAttr('pik-teleport-controls');
				}

				if (gamePadCount == 1) {

					document.querySelectorAll('#hotspot-container')[0].setAttribute('visible','true');
					document.querySelectorAll('.open-anim-help')[0].setAttribute('visible','true');
					document.querySelectorAll('.paint-menu')[0].setAttribute('visible','true');

				}

			});

			window.addEventListener("gamepaddisconnected", function(e) {

				gamePadCount--;

				if ( gamePadCount == 0 ){

					$('.cursor').attr('pik-teleport-controls');
					document.querySelectorAll('#hotspot-container')[0].setAttribute('visible','false');
					document.querySelectorAll('.open-anim-help')[0].setAttribute('visible','false');
					document.querySelectorAll('.paint-menu')[0].setAttribute('visible','false');

				}

			});

			$('.scene-model').on('model-loaded', function(){

				if (this.debug) console.log("Scene Model Loaded");
				self.hideLoading();

			});

			$('.appliances-model').on('model-loaded', function(){

				self.setEnvMap(
					$('.appliances-model')[0].object3D.children[0].children[0].children[0].children[0],
					"src/assets/cubes/envMap/",
					1.0)
				$('.appliances-model')[0].object3D.children[0].children[0].children[0].children[0].material.roughness = 2;

			});

		},

		showAnimationHelp:function(){

			this.animHelpHidden = false;
			this.animTourShown = false;
			$('.open-anim-help').attr('visible', true);
			$('.open-anim-help')[0].emit('show');
			$('.open-anim-help').children('a-image').addClass('raycaster');

		},

		hideAnimationHelp:function(){

			this.animHelpHidden = true;
			$('.open-anim-help')[0].emit('hide');
			$('.open-anim-help').children('a-image').removeClass('raycaster');
			$('.open-anim-help').children('a-image').removeClass('entered');

		},

		initDesktopListeners:function () {

			var activeMaterial = 0;
			var hotspots = document.getElementsByClassName('hotspot');
			var vrBtns = document.getElementsByClassName('vrbtn');

			var threshold = 2;
			var willTap = false;
			var pos = {};
			var self = this;

			$('a-scene').on('mousedown', function(e){

				willTap = true;
				if (e.originalEvent.pageX){

					pos.x = e.originalEvent.pageX
					pos.y = e.originalEvent.pageY

				}else if(e.originalEvent.touches){

					pos.x = e.originalEvent.touches[0].screenX;
					pos.y = e.originalEvent.touches[0].screenY

				}else { // Aframe event got nothing for click positions :/

					pos.x = 0;
					pos.y = 0;

				}

			});

			$('a-scene').on('mousemove', function(e){

				var x;
				var y;

				if (e.originalEvent.pageX){

					x = pos.x -  e.originalEvent.pageX
					y = pos.y - e.originalEvent.pageY

				}else if(e.originalEvent.touches){

					x = pos.x -  e.originalEvent.touches[0].screenX;
					y = pos.y - e.originalEvent.touches[0].screenY

				}else { // Aframe event got nothing for click positions :/

					willTap = false;

				}

				if (x*x + y*y > threshold*threshold){

					willTap = false;

				}

			});

			$('.open-anim-help').on('mouseup', function(e){

				self.openAnimHelpClick(e, this);

			});

			$('.hotspot .button').on('mouseup', function(e){

				if (!willTap) return;
				self.hotspotClick(this, self);

			});

			$('.open-paint').on('mouseup', function(e){

				if (!willTap) return;
				self.openPaintClick(e, this);

			});

			$('.paint').on('mouseup', function(e){

				if (!willTap) return;
				self.paintClick(e, this);

			});


			$('.animated-model').on('mouseup', function(){

				if (!willTap) return;
				self.animatedModelClick(this, self);

			});


			for ( var i=0; i<vrBtns.length; i++ ){

				vrBtns[i].addEventListener("mouseenter", function(){

					if (!$(this).hasClass('selected') && !$(this).hasClass('entered')){

						$(this).addClass('entered');
						//console.log("entered");
						$(this).parent()[0].emit('enter');
					}

				});

			}

			for ( var i=0; i<vrBtns.length; i++ ){

				vrBtns[i].addEventListener("mouseleave", function(){

					if ($(this).hasClass('entered')){
						$(this).removeClass('entered')
						//console.log('exited');
						$(this).parent()[0].emit('exit');
					}
					
				});

			}

		},

		tock:function(){
			if (this.tockFunc){
				this.tockFunc();
			} 
		},

		hotspotClick:function (el, self) {

			var overlaps = $('.overlapper');
			var container = $(el.parentEl).children()[0];
			var label = $(container).children()[0];
			var btn = $(container.parentNode).children()[1].querySelector('.vrbtn');

			if ($(label).hasClass('showing')){

				btn.setAttribute('src','src/assets/images/arrow.png'); // Change the icon

				if (!self.vrMode){
					if ($('#orbit-camera')[0])
						self.switchToLook(); // Need to switch to look controls before the animations.
					// Wait for look controls to be applied before starting the animation
					// Otherwise it won't get the correct starting position.
					self.tockFunc = function(){

						self.animateCameraTo(self.originalCamPos);
						// Done with this now, we can remove it.
						self.tockFunc = undefined;

					};
				}


				
				$(label).removeClass('showing');
				label.emit('hide');
				el.emit('return');

				for ( var i=0; i<overlaps.length; i++ ){

					if (overlaps[i] != el)
						overlaps[i].emit('expand');

				}

			}else{

				btn.setAttribute('src','src/assets/images/close-2.png'); // Change the icon
				var pos = $('#cameraRig').attr('position');
				var yaw = $('#camera').attr('pik-look-controls').yaw;
				var pitch = $('#camera').attr('pik-look-controls').pitch;
				self.originalCamPos = { 
					'position' : pos.x + ' ' + pos.y + ' ' + pos.z,
					'radius' : 0, // We should be in look mode in look mode, radius is 0
					'yaw' : yaw,
					'pitch' : pitch
				};
				var data = self.hotspotData[el.dataset.target];
				if (!self.vrMode){
					self.animateCameraTo(data.camera);
				}
				
				$(label).addClass('showing');
				label.emit('show');
				el.emit('corner');

				// Hide other ui objects to prevent overlap
				for ( var i=0; i<overlaps.length; i++ ){

					if (overlaps[i] != el)
						overlaps[i].emit('shrink');

				}

			}

			if(btn.parentNode.dataset.depthtest != "true"){
				setTimeout(function(){

					btn.object3D.children[0].material.depthTest = false;// Need this to fix an issue with the material not savign depthTest Stuff

				},100); // Mobile hack
			};

		},

		hideLoading:function () {


			if (this.debug) console.log("Hiding Loading");
			$('.btn.start').html('Start');
			$('.btn.start').removeClass('inactive')
			this.AnimationSequence.start();

			if (this.debug) console.log("Loading should be hidden.");


		}
	});

}));
