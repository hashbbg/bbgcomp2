void function(root){

    var get_proto = Object.getPrototypeOf,
        has_own_prop = Function.prototype.call.bind(Object.prototype.hasOwnProperty)
    

    function anew(proto, object){
        
        // defaults 
        if ( proto === undefined ) proto = {}
        if ( object === undefined ) object = {}

        // logic
        var return_object = Object.create(proto)
        
        mixin_object(return_object, object)
        if ( proto instanceof Object ) call_proto_constructors(return_object)
        if ( has_own_prop(return_object, "constructor") ) return_object["constructor"]()
        
        return return_object

        // helpers 
        function mixin_object(to, from){
            
            Object.keys(from).forEach(copy_key_val)
            
            function copy_key_val(key){
                to[key] = from[key] 
            }
        
        }
        

        function call_proto_constructors(object, proto){
            
            if ( !proto ) proto = get_proto(object)
            
            if ( proto === Object.prototype ) return
            else call_proto_constructors(object, get_proto(proto)) 
            
            // apply while falling from stack 
            if ( proto["constructor"] ) proto["constructor"].call(object)
        }
    }
    
    // export
    if ( typeof module !== "undefined" && module.exports ) 
        module.exports = anew
    else 
        root["anew"] = anew

}(this)
