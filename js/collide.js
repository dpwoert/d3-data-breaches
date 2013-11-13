// //from Mike Bostock
function collide(node) {
  var r = node.radius + 20,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}




// collide = function(alpha) {
//   var quadtree = d3.geom.quadtree(graph.data);
//   return function(d) {
//     // var r = d.radius + radius.domain()[1] + padding,
//     var r = d.radius;
//     console.log(r);
//     // var r = d.radius * 100000;
//     var nx1 = d.x - r,
//         nx2 = d.x + r,
//         ny1 = d.y - r,
//         ny2 = d.y + r;
//     quadtree.visit(function(quad, x1, y1, x2, y2) {
//       if (quad.point && (quad.point !== d)) {
//         var x = d.x - quad.point.x,
//             y = d.y - quad.point.y,
//             l = Math.sqrt(x * x + y * y),
//             // r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
//             r = d.radius + quad.point.radius + (d.color !== quad.point.color) * 10;
//         if (l < r) {
//           l = (l - r) / l * alpha;
//           d.x -= x *= l;
//           d.y -= y *= l;
//           quad.point.x += x;
//           quad.point.y += y;
//         }
//       }
//       return x1 > nx2
//           || x2 < nx1
//           || y1 > ny2
//           || y2 < ny1;
//     });
//   };
// }