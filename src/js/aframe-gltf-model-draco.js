/**
 * glTF model loader with draco compression.
 */
AFRAME.registerComponent('gltf-model-draco', {
  schema: {
    src: {
      type: 'model'
    },
    dracoDecoderPath: {
      default: '',
      type: 'string'
    }
  },

  init: function () {
    this.model = null;
    this.loader = new THREE.GLTFLoader();

  },

  update: function () {
    var self = this;
    var el = this.el;
    var src = this.data.src;
    var decoderPath = this.data.dracoDecoderPath;

    if (!src) { return; }

    if (decoderPath) {
      THREE.DRACOLoader.setDecoderPath( decoderPath );
      this.loader.setDRACOLoader( new THREE.DRACOLoader() );
    }

    this.remove();

    this.loader.load(src, function gltfLoaded (gltfModel) {
      self.model = gltfModel.scene || gltfModel.scenes[0];
      self.model.animations = gltfModel.animations;
      el.setObject3D('mesh', self.model);
      el.emit('model-loaded', {format: 'gltf', model: self.model});
    }, undefined /* onProgress */, function gltfFailed (error) {
      var message = (error && error.message) ? error.message : 'Failed to load glTF model';
      warn(message);
      el.emit('model-error', {format: 'gltf', src: src});
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
});
