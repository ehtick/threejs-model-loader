/**
 * @author Garrett Johnson / http://gkjohnson.github.io/
 * https://github.com/gkjohnson/threejs-model-loader
 */

THREE.ModelLoader = function ( manager ) {

    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

    this.modelCache = {};

    this.cachedLoaders = {};
    this.loaderMap = {

        'assimp':   'AssimpLoader',
        'dae':      'ColladaLoader',
        'gltf':     'GLTFLoader',
        'obj':      'OBJLoader2',
        'ply':      'PLYLoader',
        'stl':      'STLLoader',
        'zae':      'ColladaArchiveLoader',

        // TODO: Add more extensions

    };

}

THREE.ModelLoader.prototype = { 

    constructor: THREE.ColladaLoader,

    crossOrigin: 'Anonymous',

    getLoader: function ( loaderName, manager, loadercb ) {

        loadercb( new THREE[ loaderName ]( manager ) );

    },

    extToLoader: function ( ext, maanger, loadercb, onError ) {

        // Get the name of the loader we need
        var loaderName = this.loaderMap[ext] || null;
        if ( loaderName == null ) {

            onError( new Error( `Model Loader : No loader specified for '${ ext }' extension` ) );

            return;

        }

        // If the loader isn't already cached the lets load it
        var loader = this.cachedLoaders[ loaderName ] || null;

        if ( loader != null ) {
        
            loadercb( loader );
        
        } else {

            this.getLoader( loaderName, this.manager, loader => {
            
                this.cachedLoaders[ loaderName ] = loader;
                loadercb( loader );

            });

        }

    },

    load: function ( url, onLoad, onProgress, onError, extOverride = null ) {

        onError = onError || ( e => console.error( e ) );

        // Grab the processed data from the cache if it's been
        // loaded already
        if ( this.modelCache[ url ] != null ) {
        
            // TODO: Go through and make copies of the THREEjs models here?
            // Or do that for the cached stuff?
            var args = this.modelCache[ url ];
            requestAnimationFrame(() => onLoad(...args))
            return;

        }

        // Get the extension associated the file so we can get the
        // appropriate loader
        var extMatches = url.match(/\.([^\.\/\\]+)$/);
        var urlext = extMatches ? extMatches[1] : null;
        var ext = extOverride || urlext

        if ( url == null ) {

            onError( new Error( 'Model Loader : No file extension found' ) );
            return;

        }


        this.extToLoader( ext, this.manager, loader => {
            
            // TODO: set the cross origin etc information
            loader.load( url, ( ...args ) => {
                
                // TODO: this cache url might be relative sometimes
                // or absolute others. We should resolve to the absolute
                // path in order to properly cache
                this.modelCache[ url ] = args;
                onLoad( ...args );

            }, onProgress, onError );
        
        }, onError );

    },

    parse: function ( data, ext, onLoad, onError ) {

        onError = onError || ( e => console.error( e ) );
        
        this.extToLoader( ext, this.manager, loader => {

            onLoad( loader.parse( data ) );

        }, onError );

    },

    // Clear the model cache
    clear: function () {

        this.modelCache = {};

    }

}