// hack to fix the backside of the island door so it also configures
// this is just for that bit of the demo.

AFRAME.registerSystem('gltf-material-changer-2', {

  schema:{},

  init: function () {
    this.entities = [];

  },

  registerMe: function (el) {
    this.entities.push(el);
  },

  unregisterMe: function () {

  },

  updateMaterial: function ( path ) {

    this.loadMaterial(path);
  },

  applyToMeshes: function( texture ) {
    
    texture.flipY = false;
    texture.wrapS = 1000;
    texture.wrapT = 1000;
    texture.flipY = false;
    texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;
    for(var i=0; i<this.entities.length; i++) {
      var material = this.entities[i].components['gltf-material-changer-2'].material;

      texture.name = material.map.name;
      material.map = texture;
    }

  },

  loadMaterial: function (source) {

    var textureLoader = new AFRAME.THREE.TextureLoader();

    textureLoader.load(

      source,

      this.applyToMeshes.bind(this),

      // onProgress callback currently not supported
      undefined,

      // onError callback
      function ( err ) {
        console.error( 'An error happened.' );
      });
  },

});


AFRAME.registerComponent('gltf-material-changer-2', {

  schema: {
    diffuse: { type:'string', default: ''}, // upres path
    debug: { type: 'bool', default: false}
  },


  init: function () {

    this.system.registerMe(this.el);
    /** @type {THREE.Mesh} */
    this.model = null;
    /** @type {Array<THREE.AnimationAction>} */
    this.activeActions = [];

    this.activeMaterials = [];

    this.meshes = {};


    this.materials = [
      ''
    ];


    this.material = {};
    this.map = {};

    this.which = [
      'Cupboard_Door_2',
    ];

    this.loading = false;

    this.currentMaterial = 0;

    const model = this.el.getObject3D('mesh');

    if ( model && !Object.keys(this.meshes).length) {
      this.load(model);
    } else {
      this.el.addEventListener('model-loaded', ( event ) => {
        this.load(event.detail.model);
      });
    }
  },

  load: function (model) {

    this.indexMaterials(model);

  },

  nextMaterial: function () {

    this.currentMaterial++;
    if (this.currentMaterial > 2) {
      this.currentMaterial = 0;
    }
  },


  update: function () {


    // this.updateMaterial(
    //   this.material,
    //   this.map,
    //   this.data.diffuse
    // );
  },


  indexMaterials ( model ) {
    model.traverse((node) => {
      // debugging so we can find out the node names
      if (true && node.isMesh) {
        // assuming we have an id set
        var id = this.el.id || false;
        if (id) {
          console.info('Node Name: ', node.name, 'on id', id);
        } else {
          console.info('Node Name: ', node.name, 'no element id set');
        }
      }
      if (node.isMesh && node.material && this.which.indexOf(node.name) !== -1) {
        let materials = {};

        for (var key in node.material) {

          // rather than addingf another regex like below, just check like this.
          if (key === 'map' && node.material[key] !== null) {
            this.map = node.material.map;
            this.material = node.material;
            continue;
          }
        }
      }
    });
  },


  remove: function () {
    // return the model materials to their initial state
  },



  updateMaterial:function (material, texture, source) {
    function setMaterial ( tex ) {

      tex.flipY = false;

      tex.wrapS = 1000;
      tex.wrapT = 1000;
      tex.flipY = false;
      tex.name = material.map.name;
      tex.encoding = THREE.sRGBEncoding;
      tex.needsUpdate = true;

      material.map = tex;
    }

    if (this.loading) return;

    var textureLoader = new AFRAME.THREE.TextureLoader();

    textureLoader.load(

      source,

       setMaterial,

      // onProgress callback currently not supported
      undefined,

      // onError callback
      function ( err ) {
        console.error( 'An error happened.' );
      });
  },
});