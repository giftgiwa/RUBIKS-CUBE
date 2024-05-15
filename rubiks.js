import * as THREE from 'three';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();


renderer.setSize( window.innerWidth, window.innerHeight );

renderer.setSize(
    500,/* width */
    500 /* height */
);

console.log("Canvas width: " + renderer.domElement.style.width)
console.log("Canvas height: " + renderer.domElement.style.height)

document.body.appendChild( renderer.domElement );






function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();
