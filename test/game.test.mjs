import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,DIRS} from '../dist/engine.js';
import {generateMaze,seededRandom,distances,isOpen} from '../dist/maze.js';
test('400 randomized levels are connected, varied and have safe spawns',()=>{
 const seen=new Set();
 for(let seed=0;seed<100;seed++)for(let level=1;level<=4;level++){
  const layout=generateMaze(level,seededRandom(seed)),{map,playerStart,enemyStarts}=layout;
  assert.equal(map.length,23);assert.ok(map.every(r=>r.length===21));assert.ok(map[0].split('').every(c=>c==='#'));assert.ok(map[22].split('').every(c=>c==='#'));assert.ok(map.every(r=>r[0]==='#'&&r[20]==='#'));
  const reach=distances(map,playerStart);let crates=0;
  map.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='#')assert.ok(reach.has(`${x},${y}`));if(c==='o')crates++;}));assert.equal(crates,4);
  assert.equal(enemyStarts.length,4);assert.equal(new Set(enemyStarts.map(p=>`${p.x},${p.y}`)).size,4);
  enemyStarts.forEach((p,i)=>{assert.ok(reach.get(`${p.x},${p.y}`)>=12);assert.ok(Math.hypot(p.x-playerStart.x,p.y-playerStart.y)>=7);enemyStarts.slice(i+1).forEach(q=>assert.ok(Math.hypot(p.x-q.x,p.y-q.y)>=4));});seen.add(map.join(''));
 }
 assert.equal(seen.size,400);
});
test('movement, walls, scoring and pause use current map',()=>{const g=new Game(10);const expected=g.pellets.get('9,17')==='o'?50:10;g.start();g.ghosts.forEach(x=>x.delay=100);for(let i=0;i<4;i++)g.update(.05);assert.equal(g.player.x,9);assert.equal(g.score,expected);g.pause();const before=JSON.stringify(g.player);g.update(.05);assert.equal(JSON.stringify(g.player),before);g.pause();for(let i=0;i<300;i++)g.update(.05);assert.ok(g.walkable(g.player.x,g.player.y));for(const dir of Object.keys(DIRS)){const d=DIRS[dir];if(!g.walkable(g.player.x+d.x,g.player.y+d.y))assert.equal(g.begin(g.player,dir),false);}});
test('power capture returns enemy to its randomized origin; death preserves level',()=>{const g=new Game(20);g.start();const [key]=[...g.pellets].find(([,p])=>p==='o'),[x,y]=key.split(',').map(Number);Object.assign(g.player,{x,y,moving:false});g.eat();assert.equal(g.score,50);g.ghosts.forEach(e=>e.delay=100);Object.assign(g.ghosts[0],{x,y,moving:false,delay:0});g.update(.001);assert.equal(g.score,250);assert.equal(g.ghosts[0].x,g.enemyStarts[0].x);assert.equal(g.ghosts[0].y,g.enemyStarts[0].y);const map=g.map,origins=JSON.stringify(g.enemyStarts);g.power=0;g.invincible=0;Object.assign(g.ghosts[1],{x,y,moving:false,delay:0});g.update(.001);assert.equal(g.lives,2);assert.equal(g.map,map);assert.equal(JSON.stringify(g.enemyStarts),origins);assert.equal(g.player.x,g.playerStart.x);assert.equal(g.player.y,g.playerStart.y);});
test('next level rebuilds layout; restart creates a fresh maze',()=>{const g=new Game(30);g.start();const first=g.map.join('');g.pellets=new Map([['10,17','.']]);g.eat();assert.equal(g.state,'won');g.start();assert.equal(g.level,2);assert.notEqual(g.map.join(''),first);assert.equal(g.score,10);g.lives=1;g.invincible=0;Object.assign(g.ghosts[0],{x:g.player.x,y:g.player.y,delay:0});g.update(.001);assert.equal(g.state,'over');const second=g.map.join('');g.start();assert.equal(g.state,'playing');assert.equal(g.lives,3);assert.equal(g.level,1);assert.equal(g.score,0);assert.notEqual(g.map.join(''),second);});
