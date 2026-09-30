import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {clone} from './vendor/utils/SkeletonUtils.js';
let hunterAsset,enemyAsset;
export async function loadCharacters(){const loader=new GLTFLoader();[hunterAsset,enemyAsset]=await Promise.all([loader.loadAsync(new URL('./models/ashe-animated.glb',import.meta.url).href),loader.loadAsync(new URL('./models/red-melee-animated.glb',import.meta.url).href)]);}
export function createCharacter(asset,hunter=false){
 const group=new THREE.Group(),model=clone(asset.scene),mixer=new THREE.AnimationMixer(model);
 const idleClip=asset.animations.find(c=>/^Idle1$/i.test(c.name))||asset.animations[0],runClip=asset.animations.find(c=>/^Run$/i.test(c.name))||idleClip;
 const idle=idleClip?mixer.clipAction(idleClip):null,run=runClip?mixer.clipAction(runClip):idle;
 idle?.play();mixer.update(0);model.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(model,true),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const scale=Math.min(1.15/Math.max(size.y,.001),.85/Math.max(size.x,size.z,.001)),fit=new THREE.Group();
 fit.scale.setScalar(scale);model.position.sub(new THREE.Vector3(center.x,bounds.min.y,center.z));fit.add(model);group.add(fit);
 const materials=[];
 model.traverse(object=>{if(!object.isMesh)return;const copy=material=>{const result=material.clone();materials.push({material:result,color:result.color?.clone(),emissive:result.emissive?.clone(),intensity:result.emissiveIntensity});return result;};object.material=Array.isArray(object.material)?object.material.map(copy):copy(object.material);object.frustumCulled=false;});
 if(hunter){const ring=new THREE.Mesh(new THREE.TorusGeometry(.39,.025,8,28),new THREE.MeshBasicMaterial({color:0xffda55}));ring.rotation.x=-Math.PI/2;ring.position.y=.02;group.add(ring);}
 group.userData={mixer,idle,run,current:idle,materials,model};return group;
}
export const createHunter=()=>createCharacter(hunterAsset,true);
export const createZombie=()=>createCharacter(enemyAsset);
export function updateHunter(group,dt,moving,direction){updateZombie(group,dt,false,false,moving,direction);}
export function updateZombie(group,dt,powered,flashing,moving,direction){
 const data=group.userData,action=moving?data.run:data.idle;
 if(action!==data.current){data.current?.fadeOut(.15);action?.reset().fadeIn(.15).play();data.current=action;}
 data.mixer.update(dt);group.rotation.y={down:0,up:Math.PI,left:-Math.PI/2,right:Math.PI/2}[direction]??0;
 for(const {material,color,emissive,intensity} of data.materials){if(color)powered?material.color.setHex(flashing?0xe8edff:0x5489ff):material.color.copy(color);if(emissive){powered?material.emissive.setHex(flashing?0x91b6ff:0x164aff):material.emissive.copy(emissive);material.emissiveIntensity=powered?.8:intensity;}}
}
export function disposeCharacter(group){const data=group?.userData;if(data?.crate){group.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});return;}if(!data?.mixer)return;data.mixer.stopAllAction();data.mixer.uncacheRoot(data.model);data.materials.forEach(({material})=>material.dispose());group.children.filter(child=>child.isMesh).forEach(child=>{child.geometry.dispose();child.material.dispose();});}

// Collectible supply crate, separate from the animated player model.
export function createCrate(){
 const group=new THREE.Group();group.userData.crate=true;
 const add=(size,position,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,roughness:.65}));m.position.set(...position);group.add(m);};
 add([.55,.42,.5],[0,.21,0],0x9a602c);
 add([.6,.09,.55],[0,.44,0],0xc89349);
 for(const x of [-.19,.19]){add([.055,.44,.53],[x,.22,0],0x403d39);add([.06,.035,.57],[x,.5,0],0x403d39);}
 add([.11,.14,.035],[0,.34,.283],0xffda55);
 return group;
}
