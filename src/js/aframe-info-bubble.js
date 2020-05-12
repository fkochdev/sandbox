/**
 * look-controls. Update entity pose, factoring mouse, touch, and WebVR API data.
 */


// To avoid recalculation at every mouse movement tick


AFRAME.registerComponent('info-bubble', {
	dependencies: [],

	schema: {
		borderRadius: { default:0.05, type:'number' },
		borderColor: { default:'#000', type:'color' },
		// outlineMargin: { default:0.05, type:'number' },
		// outlineColor: { default:'#cebb6b', type:'color' },
		// outlineRadius: { default:0.01, type:'number' },
		color: { default:'#fff', type:'color' },
		width: { default:1, type:'number' },
		height: { default:1, type:'number' },
		pointerPosition: { default:'bottom', type:'string' },
		pointerOffset: { default:'bottom', type:'string' },
		pointerSize: { default:0.1, type:'number' }
	},

	corners: { bottomRight:null, bottomLeft:null, topLeft:null, topRight:null },
	borders: { top:null, bottom:null, right:null, left:null },
	// outline: { 
	// 	corners: { bottomRight:null, bottomLeft:null, topLeft:null, topRight:null },
	// 	edges: { top:null, bottom:null, right:null, left:null }
	// },
	pointer: null,
	background:null,
	// outlineMaterial:new THREE.MeshBasicMaterial( {depthTest: false} ),

	init: function () {

		var data = this.data;
		var borderMaterial = new THREE.MeshBasicMaterial( {color: data.borderColor, depthTest: false} );
		var backgroundMaterial = new THREE.MeshBasicMaterial( {color: data.color, depthTest: false} );

		// this.outlineMaterial.color = new THREE.Color(data.outlineColor);

		this.sceneEl = this.el.sceneEl;
	    this.object = this.el.object3D;

		// Make corners
		this.corners.bottomRight = new THREE.Mesh( new THREE.CircleBufferGeometry( 1, 10, -Math.PI/2, Math.PI/2 ), borderMaterial );
		this.corners.bottomLeft = new THREE.Mesh( new THREE.CircleBufferGeometry( 1, 10, Math.PI, Math.PI/2 ), borderMaterial );
		this.corners.topRight = new THREE.Mesh( new THREE.CircleBufferGeometry( 1, 10, 0, Math.PI/2 ), borderMaterial );
		this.corners.topLeft = new THREE.Mesh( new THREE.CircleBufferGeometry( 1, 10, Math.PI/2, Math.PI/2 ), borderMaterial );

		// Make borders
		this.borders.top = new THREE.Mesh( new THREE.PlaneBufferGeometry(), borderMaterial );
		this.borders.bottom = new THREE.Mesh( new THREE.PlaneBufferGeometry(), borderMaterial );
		this.borders.left = new THREE.Mesh( new THREE.PlaneBufferGeometry(), borderMaterial );
		this.borders.right = new THREE.Mesh( new THREE.PlaneBufferGeometry(), borderMaterial );

		// Make center background
		this.background = new THREE.Mesh( new THREE.PlaneBufferGeometry(), backgroundMaterial );

		// Make the pointer
		this.pointer = new THREE.Mesh( new THREE.PlaneBufferGeometry(), borderMaterial );

		this.object.add(this.corners.bottomRight);
		this.object.add(this.corners.bottomLeft);
		this.object.add(this.corners.topLeft);
		this.object.add(this.corners.topRight);

		this.object.add(this.borders.top);
		this.object.add(this.borders.bottom);
		this.object.add(this.borders.left);
		this.object.add(this.borders.right);

		this.object.add(this.background);

		this.object.add(this.pointer);

		this.updatePositions();

	},

	updatePositions: function () {

		var sqrt2 = Math.sqrt(2);
		var data = this.data;
		var pointerTipPos = new THREE.Vector3(); // Used to position everything around the pointer
		this.pointer.rotation.z = Math.PI/4;
		if ( data.pointerPosition == "bottom" ){
			this.pointer.position.y = this.squareLength(data.pointerSize)/2;
			pointerTipPos.set(data.width/2, -data.borderRadius-this.squareLength(data.pointerSize)/2, 0);
		}else if ( data.pointerPosition == "top" ){
			pointerTipPos.set(data.width/2, data.height+data.pointerSize/2, 0);
		}else if ( data.pointerPosition == "left" ){
			pointerTipPos.set(-data.pointerSize/2, data.height/2, 0);
		}else if ( data.pointerPosition == "right" ){
			pointerTipPos.set(data.width+data.pointerSize/2, data.height/2, 0);
		}

		this.pointer.scale.set(data.pointerSize, data.pointerSize, data.pointerSize);

		this.corners.bottomLeft.position.set(0,0,0).sub(pointerTipPos);
		this.corners.topRight.position.set(data.width,data.height,0).sub(pointerTipPos);
		this.corners.topLeft.position.set(0,data.height,0).sub(pointerTipPos);
		this.corners.bottomRight.position.set(data.width,0,0).sub(pointerTipPos);

		this.corners.bottomLeft.scale.set(data.borderRadius, data.borderRadius, 1);
		this.corners.topLeft.scale.set(data.borderRadius, data.borderRadius, 1);
		this.corners.topRight.scale.set(data.borderRadius, data.borderRadius, 1);
		this.corners.bottomRight.scale.set(data.borderRadius, data.borderRadius, 1);

		this.borders.bottom.position.set(data.width/2,-data.borderRadius/2,0).sub(pointerTipPos);
		this.borders.top.position.set(data.width/2,data.height+data.borderRadius/2,0).sub(pointerTipPos);
		this.borders.right.position.set(data.width+data.borderRadius/2,data.height/2,0).sub(pointerTipPos);
		this.borders.left.position.set(-data.borderRadius/2,data.height/2,0).sub(pointerTipPos);

		this.borders.top.scale.set(data.width, data.borderRadius, 1);
		this.borders.bottom.scale.set(data.width, data.borderRadius, 1);
		this.borders.right.scale.set(data.borderRadius, data.height, 1);
		this.borders.left.scale.set(data.borderRadius, data.height, 1);

		// Remove old outlines

		// this.object.remove(this.outline.corners.bottomRight);
		// this.object.remove(this.outline.corners.bottomLeft);
		// this.object.remove(this.outline.corners.topLeft);
		// this.object.remove(this.outline.corners.topRight);

		// Make outline corners
		// this.outline.corners.bottomRight = new THREE.Mesh( 
		// 	new THREE.RingBufferGeometry( data.borderRadius+data.outlineMargin, data.borderRadius+data.outlineRadius+data.outlineMargin, 10, 2, -Math.PI/2, Math.PI/2 ), 
		// 	this.outlineMaterial );
		// this.outline.corners.bottomLeft = new THREE.Mesh( 
		// 	new THREE.RingBufferGeometry( data.borderRadius+data.outlineMargin, data.borderRadius+data.outlineMargin+data.outlineRadius, 10, 2, Math.PI, Math.PI/2 ), 
		// 	this.outlineMaterial );
		// this.outline.corners.topRight = new THREE.Mesh( 
		// 	new THREE.RingBufferGeometry( data.borderRadius+data.outlineMargin, data.borderRadius+data.outlineMargin+data.outlineRadius, 10, 2, 0, Math.PI/2 ), 
		// 	this.outlineMaterial );
		// this.outline.corners.topLeft = new THREE.Mesh( 
		// 	new THREE.RingBufferGeometry( data.borderRadius+data.outlineMargin, data.borderRadius+data.outlineMargin+data.outlineRadius, 10, 2, Math.PI/2, Math.PI/2 ), 
		// 	this.outlineMaterial );

		// this.object.add(this.outline.corners.bottomRight);
		// this.object.add(this.outline.corners.bottomLeft);
		// this.object.add(this.outline.corners.topLeft);
		// this.object.add(this.outline.corners.topRight);

		// this.outline.corners.bottomLeft.position.set(0,0,0).sub(pointerTipPos);
		// this.outline.corners.topRight.position.set(data.width,data.height,0).sub(pointerTipPos);
		// this.outline.corners.topLeft.position.set(0,data.height,0).sub(pointerTipPos);
		// this.outline.corners.bottomRight.position.set(data.width,0,0).sub(pointerTipPos);

	// 	if ( data.pointerPosition == "bottom" ){
	// 		this.outline.edges.bottom = new THREE.Object3D();

	// 		var leftSide = new THREE.Mesh( new THREE.PlaneBufferGeometry(), this.outlineMaterial );
	// 		leftSide.position.set(
	// 			data.width/4-data.pointerSize/2,
	// 			-data.outlineMargin-data.outlineRadius/2-data.borderRadius,
	// 			0).sub(pointerTipPos);
	// 		leftSide.scale.set((data.width - data.pointerSize)/2-data.outlineMargin, data.outlineRadius, 1);

	// 		var rightSide = new THREE.Mesh( new THREE.PlaneBufferGeometry(), this.outlineMaterial );
	// 		rightSide.position.set(
	// 			data.width*3/4+data.pointerSize/2,
	// 			-data.outlineMargin-data.outlineRadius/2-data.borderRadius,
	// 			0).sub(pointerTipPos);
	// 		rightSide.scale.set((data.width - data.pointerSize)/2-data.outlineMargin, data.outlineRadius, 1);

	// 		var p = data.pointerSize/2;
	// 		var o = data.outlineMargin + data.outlineRadius/2;
	// 		var h = Math.sqrt(Math.pow(p,2)+Math.pow(o,2));
	// 		var theta = Math.atan(o/p);
	// 		var phi = Math.PI*3/4-theta;
	// 		var x = h*Math.sin(phi);
	// 		var y = h*Math.cos(phi);

	// 		var leftPointerOutline = new THREE.Mesh( new THREE.PlaneBufferGeometry(), this.outlineMaterial );
	// 		leftPointerOutline.position.set(
	// 			-x,
	// 			-y,
	// 			0);
	// 		leftPointerOutline.scale.set(
	// 			data.pointerSize, 
	// 			data.outlineRadius, 
	// 			1);
	// 		leftPointerOutline.rotation.z = -Math.PI/4;

	// 		var rightPointerOutline = new THREE.Mesh( new THREE.PlaneBufferGeometry(), this.outlineMaterial );
	// 		rightPointerOutline.position.set(
	// 			x,
	// 			-y, 
	// 			0);
	// 		rightPointerOutline.scale.set(
	// 			data.pointerSize,
	// 			data.outlineRadius, 
	// 			1);
	// 		rightPointerOutline.rotation.z = Math.PI/4;

	// 		var pointerOutlineCap = new THREE.Mesh( 
	// 			new THREE.RingBufferGeometry(
	// 				data.outlineMargin, 
	// 				data.outlineRadius+data.outlineMargin, 
	// 				10, 
	// 				2, 
	// 				-Math.PI*3/4, 
	// 				Math.PI/2), 
	// 			this.outlineMaterial );
	// 		pointerOutlineCap.position.set(0,0,0);

	// 		this.outline.edges.bottom.add(leftSide);
	// 		this.outline.edges.bottom.add(rightSide);
	// 		this.outline.edges.bottom.add(leftPointerOutline);
	// 		this.outline.edges.bottom.add(rightPointerOutline);
	// 		this.outline.edges.bottom.add(pointerOutlineCap);
	// 	}else{
	// 		this.outline.edges.bottom = new THREE.Mesh( new THREE.PlaneBufferGeometry(), this.outlineMaterial );
	// 		this.outline.edges.bottom.position.set(
	// 			data.width/2,
	// 			-data.outlineMargin-data.outlineRadius/2-data.borderRadius,
	// 			0).sub(pointerTipPos);
	// 		this.outline.edges.bottom.scale.set(data.width, data.outlineRadius, 1);
	// 	}
	// 	this.outline.edges.top = new THREE.Mesh( new THREE.PlaneBufferGeometry(), this.outlineMaterial );
	// 	this.outline.edges.top.position.set(
	// 		data.width/2,
	// 		data.height+data.borderRadius+data.outlineMargin+data.outlineRadius/2,
	// 		0).sub(pointerTipPos);
	// 	this.outline.edges.right = new THREE.Mesh( new THREE.PlaneBufferGeometry(), this.outlineMaterial );
	// 	this.outline.edges.right.position.set(
	// 		data.width+data.borderRadius+data.outlineMargin+data.outlineRadius/2,
	// 		data.height/2,
	// 		0).sub(pointerTipPos);
	// 	this.outline.edges.left = new THREE.Mesh( new THREE.PlaneBufferGeometry(), this.outlineMaterial );
	// 	this.outline.edges.left.position.set(
	// 		-data.borderRadius-data.outlineMargin-data.outlineRadius/2,
	// 		data.height/2,
	// 		0).sub(pointerTipPos);

	// 	this.outline.edges.top.scale.set(data.width, data.outlineRadius, 1);
	// 	this.outline.edges.right.scale.set(data.outlineRadius, data.height, 1);
	// 	this.outline.edges.left.scale.set(data.outlineRadius, data.height, 1);

		this.background.scale.set(data.width, data.height, 1);
		this.background.position.set(data.width/2, data.height/2, 0).sub(pointerTipPos);

	// 	this.object.add(this.outline.edges.top);
	// 	this.object.add(this.outline.edges.bottom);
	// 	this.object.add(this.outline.edges.left);
	// 	this.object.add(this.outline.edges.right);

	},

	update: function (oldData) {
		var data = this.data;
	},

	tick: function (t) {
		var data = this.data;
		if (!data.enabled) { return; }
		this.updateOrientation();
	},

	play: function () {
		this.addEventListeners();
	},

	pause: function () {
		this.removeEventListeners();
	},

	remove: function () {
		this.removeEventListeners();
	},

	addEventListeners: function () {
	},

	removeEventListeners: function () {
	},

	squareLength: function (val) {

		return Math.sqrt(val*val + val*val);

	}
});