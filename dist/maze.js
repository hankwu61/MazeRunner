export const DIRECTIONS={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}};
export const isOpen=(map,x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&!!map[y]?.[x]&&map[y][x]!=='#';
export function seededRandom(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
export function distances(map,start){const result=new Map([[`${start.x},${start.y}`,0]]),queue=[start];for(let i=0;i<queue.length;i++){const p=queue[i];for(const d of Object.values(DIRECTIONS)){const x=p.x+d.x,y=p.y+d.y,key=`${x},${y}`;if(isOpen(map,x,y)&&!result.has(key)){result.set(key,result.get(`${p.x},${p.y}`)+1);queue.push({x,y});}}}return result;}
const shuffle=(list,random)=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};

export function generateMaze(level,random=Math.random){
 const map=Array.from({length:23},()=>Array(21).fill('#'));
 const playerStart={x:10,y:17};
 const styles=['曲折沙徑','縱橫古道','沙丘廣場','交錯迴廊'];
 const style=(level-1)%styles.length;
 // Randomized depth-first carving connects every odd-coordinate cell.
 const stack=[{x:1,y:1}];map[1][1]='.';
 while(stack.length){const p=stack.at(-1);const options=shuffle(Object.values(DIRECTIONS).filter(d=>{const x=p.x+d.x*2,y=p.y+d.y*2;return x>0&&x<20&&y>0&&y<22&&map[y][x]==='#';}),random);
  if(!options.length){stack.pop();continue;}
  if(style===1)options.sort((a,b)=>Math.abs(b.y)-Math.abs(a.y));
  const d=options[0],q={x:p.x+d.x*2,y:p.y+d.y*2};map[p.y+d.y][p.x+d.x]='.';map[q.y][q.x]='.';stack.push(q);
 }
 // Remove selected dividing walls for alternate routes; never add isolated rooms.
 const dividers=[];
 for(let y=1;y<22;y++)for(let x=1;x<20;x++)if(map[y][x]==='#'&&((isOpen(map,x-1,y)&&isOpen(map,x+1,y))||(isOpen(map,x,y-1)&&isOpen(map,x,y+1))))dividers.push({x,y});
 shuffle(dividers,random).slice(0,[28,38,24,48][style]).forEach(p=>map[p.y][p.x]='.');
 if(style===2){for(let i=0;i<4;i++){const x=3+2*Math.floor(random()*7),y=3+2*Math.floor(random()*8);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)map[y+dy][x+dx]='.';}}
 // The starting lane has two exits even when its center was a divider.
 map[17][9]='.';map[17][10]=' ';map[17][11]='.';
 const reachable=distances(map,playerStart);
 const candidates=shuffle([...reachable].filter(([key,d])=>{const [x,y]=key.split(',').map(Number);return d>=12&&Math.hypot(x-playerStart.x,y-playerStart.y)>=7;}).map(([key])=>{const [x,y]=key.split(',').map(Number);return {x,y};}),random);
 const enemyStarts=[];
 for(const p of candidates)if(enemyStarts.every(q=>Math.hypot(p.x-q.x,p.y-q.y)>=4)){enemyStarts.push(p);if(enemyStarts.length===4)break;}
 if(enemyStarts.length!==4)throw Error('Unable to place separated enemy spawns');
 enemyStarts.forEach(p=>map[p.y][p.x]=' ');
 // One energy crate in each quadrant, at a randomized reachable position.
 for(const [left,top] of [[true,true],[false,true],[true,false],[false,false]]){
  const options=[];for(let y=1;y<22;y++)for(let x=1;x<20;x++)if(map[y][x]==='.'&&(x<10)===left&&(y<11)===top)options.push({x,y});
  const p=options[Math.floor(random()*options.length)];map[p.y][p.x]='o';
 }
 return {map:map.map(r=>r.join('')),playerStart,enemyStarts,style:styles[style]};
}
