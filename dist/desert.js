import * as THREE from './vendor/three.module.js';

export function addDesert(scene, map) {
  // Keep the playable area level; sculpt dunes only beyond its boundary.
  const terrain = new THREE.PlaneGeometry(90,90,180,180);
  terrain.rotateX(-Math.PI/2);
  const positions=terrain.attributes.position,colors=[];
  const low=new THREE.Color(0xb88443),high=new THREE.Color(0xe6bd76);
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i);
    const outside=Math.max(Math.abs(x)-10.8,Math.abs(z)-11.8,0);
    const blend=THREE.MathUtils.smoothstep(outside,0,5);
    const wave=Math.sin(x*.29+z*.17)+.55*Math.sin(z*.48-x*.11);
    const ripple=Math.sin(x*5+z*1.7+Math.sin(z*.5))*.025;
    positions.setY(i,-.21+blend*(.8+wave*.7)+ripple*(.15+blend));
    const color=low.clone().lerp(high,THREE.MathUtils.clamp(.55+wave*.16+ripple*2,0,1));
    colors.push(color.r,color.g,color.b);
  }
  terrain.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  terrain.computeVertexNormals();
  const terrainMesh=new THREE.Mesh(terrain,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));scene.add(terrainMesh);

  const cells=[];map.forEach((row,z)=>[...row].forEach((c,x)=>{if(c==='#')cells.push([x-10,z-11]);}));
  const mortar=new THREE.InstancedMesh(new THREE.BoxGeometry(.93,.57,.93),new THREE.MeshStandardMaterial({color:0x734638,roughness:1}),cells.length);
  const brickGeo=new THREE.BoxGeometry(1,1,1);
  // Three courses, with alternating joints to make actual red brickwork.
  const bricks=new THREE.InstancedMesh(brickGeo,new THREE.MeshStandardMaterial({roughness:.95}),cells.length*12);
  const dummy=new THREE.Object3D(),palette=[0xa33124,0xb6402d,0x922a23,0xbd4c35,0xa93a2b];let index=0;
  cells.forEach(([x,z],cell)=>{
    dummy.position.set(x,.085,z);dummy.scale.set(1,1,1);dummy.updateMatrix();mortar.setMatrixAt(cell,dummy.matrix);
    for(let course=0;course<3;course++)for(let a=0;a<2;a++)for(let b=0;b<2;b++){
      const flip=course%2===1;
      dummy.position.set(x+(a-.5)*.48,-.11+course*.195,z+(b-.5)*.48);
      dummy.scale.set(flip?.445:.455,.172,flip?.455:.445);dummy.updateMatrix();
      bricks.setMatrixAt(index,dummy.matrix);bricks.setColorAt(index,new THREE.Color(palette[(cell*7+course*3+a+b)%palette.length]));index++;
    }
  });
  scene.add(mortar,bricks);
  return {terrain,bricks,mortar,dispose(){for(const object of [terrainMesh,bricks,mortar]){scene.remove(object);object.geometry.dispose();object.material.dispose();object.dispose?.();}}};
}
