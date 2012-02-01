function load_images(image_object, callback){
    var to_load = 0,
        images

    if ( image_object instanceof Array ) images = []
    else images = {}
    
    function on_load(){
        to_load -= 1
        if ( to_load == 0 && callback ) callback(images)
    }
    
    function on_error(){
    
    }

    function load(key, val){
        var image = new Image()
        to_load += 1
        image.src = val
        image.onload = on_load
        images[key] = image
    }

    for ( var prop in image_object ){
        load(prop, image_object[prop])   
    }

}

module.exports = load_images
