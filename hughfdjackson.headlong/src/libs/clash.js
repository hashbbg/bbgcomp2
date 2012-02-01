  
var clash = {

    point_point: function(A, B){
        return ( (A.x == B.x) && (A.y == B.y) )
    },
    point_circle: function(A, B){
        var rsq = B.radius * B.radius,
            diffx = A.x - B.x,
            diffy = A.y - B.y,
            distsq = (diffx*diffx) + (diffy*diffy)

        return distsq <= rsq
    },
    point_aabb: function(A, B){
        var Bright = B.x + B.width,
            Bbottom = B.y + B.height
        
        return (A.x >= B.x && A.x <= Bright && A.y >= B.y && A.y <= Bbottom)
    },
    point_poly: function(A, B){
        var verts = B.vertices,
            l = verts.length,
            odd = false
                                
        // for info about this algorithm, see http://paulbourke.net/geometry/insidepoly/ (it's the first one, basically)
        for (var i = 0, j = l - 1; i < l; j = i++ ){
            var v_i = verts[i],
                v_j = verts[j]
                
            //  for gradient
            if ( (A.x <= v_i.x) != (A.x <= v_j.x) || (A.x < v_i.x) != (A.x < v_j.x) ){
                var m = (v_i.y - v_j.y)/(v_i.x - v_j.x),
                    y_for_x = m*(A.x - v_i.x) + v_i.y
                
                // check if on line
                if ( A.y == y_for_x ) return true 
                
                // otherwise, project
                else if ( A.y < y_for_x ) odd = !odd
            
                // if v_i.x == v_j.x, m will be -Infinity || Infinity, and y_for_x will be NaN, so do another check
                else if ( m == Math.abs(Infinity) && A.y <= v_i.y ) odd = !odd    
            
            
            }

        }
        return odd
        
    },
    circle_circle: function(A, B){
        var rdistsq = (A.radius + B.radius) * (A.radius + B.radius),
            diffx = A.x - B.x,
            diffy = A.y - B.y,
            distsq = (diffx*diffx) + (diffy*diffy)

        return distsq <= rdistsq
    },
    circle_aabb: function(A, B){
        var Bx = B.x,
            By = B.y,
            Bright = B.x + B.width,
            Bbottom = B.y + B.height
                                
        // test point->circle for each corner
        if ( this.point_circle({x: Bx, y: By}, A) ) return true
        if ( this.point_circle({x: Bright, y: By}, A) ) return true
        if ( this.point_circle({x: Bx, y: Bbottom}, A) ) return true
        if ( this.point_circle({x: Bright, y: Bbottom}, A) ) return true
        
        // test aabb->aabb if the corners don't collide     
        var A_aabb = {x: A.x, y: A.y}
        A_aabb.width = A.radius
        A_aabb.height = A.radius       
        return this.aabb_aabb(A_aabb, B)
    },
    circle_poly: function(A, B){},
    aabb_aabb: function(A, B){
        var Aright = A.x + A.width,
            Abottom = A.y + A.height,
            Bright = B.x + B.width,
            Bbottom = B.y + B.height
            
        return !(A.x > Bright || Aright < B.x || A.y > Bbottom || Abottom < B.y)
        
    },
    aabb_poly: function(A, B){},
    poly_poly: function(A, B){}
}

module.exports = clash
