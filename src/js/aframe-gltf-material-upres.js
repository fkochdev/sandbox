AFRAME.registerComponent('gltf-material-upres', {

  schema: {
    upres: {type:'string', default: ''}, // upres path
    mobile: {type:'boolean', default:true}

  },


  init: function () {
    /** @type {THREE.Mesh} */
    this.model = null;
    /** @type {Array<THREE.AnimationAction>} */
    this.activeActions = [];

    this.activeMaterials = [];

    this.meshes = {};

    const model = this.el.getObject3D('mesh');

    // testing out some load methods i can know abnout
    this.el.addEventListener('model-loaded', () => {
      console.log('model-loaded');
    });


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

    if (this.data.basePath) {
      this.upResMaterials();
    }
  },


  upResMaterials () {

    var texturePath = this.data.basePath;
    // are we downnsampliong
    if (this.data.mobile) {
      texturePath += (this.el.sceneEl.isMobile) ? 'medium/' : 'high/';
    } else {
      texturePath += 'high/';
    }

    for (var mesh in this.meshes) {
      for (var map in this.meshes[mesh].maps) {
        if ( map !== 'envMap') {
          var texture = this.meshes[mesh].maps[map];
          this.updateMaterial(
            this.meshes[mesh].material,
            texture,
            texturePath + texture.name
          );
        }
      }
    }

  },


  indexMaterials ( model ) {
    model.traverse((node) => {
      if (node.isMesh && node.material) {
        let materials = {};

        for (var key in node.material) {

          // rather than addingf another regex like below, just check like this.
          if (key === 'map' && node.material[key] !== null) {
            materials.map = node.material.map;
            continue;
          }
          // checking for other maps using a regex
          if (node.material.hasOwnProperty(key) && /Map$/.test(key) && node.material[key] !== null ) {
            materials[key] = node.material[key];
          }
        }
        if (node.material) {
          this.meshes[node.name] = {
            material : node.material,
            maps : materials
          };
          // this.meshes[node.name].material = node.material;
          // this.meshes[node.name].maps = materials;
        }
      }
      // if (node.isMesh) node.material.map = tex;
    });
  },


  update: function () {

    console.log('update captured');
    var mesh = this.el.getObject3D('mesh');
    var data = this.data;
    // debugger;
    if (!mesh) { return; }
    else {
      console.log(this.listObjects());
    }
    // mesh.traverse(function (node) {
    //   if (node.isMesh) {
    //     node.material.opacity = data;
    //     node.material.transparent = data < 1.0;
    //     node.material.needsUpdate = true;
    //   }
    // });
  },

  remove: function () {
    // return the model materials to their initial state
  },

  test () {
    return 'hello test return';
  },

  showModel: function () {
    return this.model;
  },

  getObject: function (objectName) {
    var object = this.el.getObject3D('mesh').getObjectByName(objectName);
    if (!object) {return;}
     
    return object;;
  },

  listObjects: function () {
    var objects = this.el.getObject3D('mesh').children.map(function(object) { return object.name;});
    return objects;
  },

  loadTexture (map, source) {

    var textureLoader = new AFRAME.THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    textureLoader.load(
      source,
      function() {

      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  },

  updateMaterial (material, texture, source) {
    function setMaterial ( tex ) {
      // texture = tex;
      tex.flipY = false;


      // tex.format = 1023;
      tex.wrapS = 1000;
      tex.wrapT = 1000;
      tex.flipY = false;
      tex.name = material.map.name;
      tex.encoding = THREE.sRGBEncoding;
      tex.needsUpdate = true;



      material.map = tex;
      // material.map.needsUpdate = true;
      // material.needsUpdate = true;
    }

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

  updateSource (material, texutre, source) {
    function setMaterial ( tex ) {
      // texture = tex;
      material.map = tex;
      material.needsUpdate = true;
    }

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


  loadMaterial: function ( type, source ) {

    var textureLoader = new AFRAME.THREE.TextureLoader();

    textureLoader.load(

      source,

      this.updateMaterial,

      // onProgress callback currently not supported
      undefined,

      // onError callback
      function ( err ) {
        console.error( 'An error happened.' );
      });
  },

  // updateMaterial: function ( objectName, materialType, materialSource ) {
  //       var material = document.getElementById('target').object3D.parent.getObjectByName('CENTER_UNIT').children[0].material;

  //       var material = this.getObject(objectName).loadMaterial(materialType, materialSource);

  //       var  newMaterial  = new AFRAME.THREE.MeshBasicMaterial({map: texture});

  //       material.map = texture;

  //       currentMat++;
  // }

});