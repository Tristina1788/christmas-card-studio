type Slot={id:string;x:number;y:number;width:number;height:number};
type TextField={x:number;y:number;maxWidth:number;maxChars:number;maxFont:number;minFont:number};
type Template={id:string;name:string;width:number;height:number;inches:[number,number];photoSlots:Slot[];watercolorLayers:string[];texts:{greeting:TextField;family:TextField;year:TextField}};
const CLASSIC:Template={id:'evergreen-ribbon',name:'Evergreen & Ribbon',width:1500,height:2100,inches:[5,7],photoSlots:[{id:'family',x:275,y:565,width:950,height:1110}],watercolorLayers:['painted-evergreen','cranberry-sprigs','red-ribbon','oval-photo-mat'],texts:{greeting:{x:750,y:415,maxWidth:990,maxChars:42,maxFont:100,minFont:44},family:{x:750,y:1850,maxWidth:1030,maxChars:46,maxFont:79,minFont:29},year:{x:750,y:1980,maxWidth:800,maxChars:4,maxFont:59,minFont:30}}};
// Add templates to this registry; the editor reads slot geometry and field limits from config.
const templates:Record<string,Template>={
  classic: {...CLASSIC,id:'classic',name:'Classic Evergreen',photoSlots:[{id:'family',x:245,y:560,width:1010,height:1120}],texts:{greeting:{x:750,y:425,maxWidth:1120,maxChars:42,maxFont:116,minFont:42},family:{x:750,y:1865,maxWidth:1080,maxChars:46,maxFont:90,minFont:30},year:{x:750,y:1975,maxWidth:700,maxChars:4,maxFont:54,minFont:30}}},
  garland: {...CLASSIC,id:'garland',name:'Winter Garland',photoSlots:[{id:'family',x:275,y:495,width:950,height:1180}],texts:{greeting:{x:750,y:320,maxWidth:1160,maxChars:42,maxFont:112,minFont:42},family:{x:750,y:1870,maxWidth:1100,maxChars:46,maxFont:88,minFont:30},year:{x:750,y:1990,maxWidth:700,maxChars:4,maxFont:54,minFont:30}}},
  cranberry: {...CLASSIC,id:'cranberry',name:'Cranberry Ribbon',photoSlots:[{id:'family',x:260,y:590,width:980,height:1100}],texts:{greeting:{x:750,y:390,maxWidth:1100,maxChars:42,maxFont:118,minFont:42},family:{x:750,y:1870,maxWidth:1080,maxChars:46,maxFont:88,minFont:30},year:{x:750,y:1980,maxWidth:700,maxChars:4,maxFont:54,minFont:30}}}
};
let TEMPLATE=templates.classic;

const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const editor=$<HTMLCanvasElement>('editorCanvas'),landing=$<HTMLCanvasElement>('landingCanvas');
const ctx=editor.getContext('2d')!,landCtx=landing.getContext('2d')!;
let uploaded:CanvasImageSource|null=null,photoWidth=0,photoHeight=0,zoom=1,offsetX=0,offsetY=0,activeUrl:string|null=null;
let sample:HTMLImageElement|null=null;
const sampleSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#a6b8b2"/><stop offset="1" stop-color="#e6d4b5"/></linearGradient><linearGradient id="coat" x2="1" y2="1"><stop stop-color="#b28c70"/><stop offset="1" stop-color="#76584e"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="16"/></filter></defs><rect width="900" height="900" fill="url(#sky)"/><g filter="url(#blur)" opacity=".8"><circle cx="120" cy="150" r="150" fill="#506d56"/><circle cx="820" cy="90" r="180" fill="#49664c"/><circle cx="170" cy="430" r="130" fill="#6f8067"/><circle cx="790" cy="430" r="160" fill="#6c7b5d"/><rect y="590" width="900" height="310" fill="#a9a38b"/></g><g><path d="M115 900V690Q130 535 260 540Q380 550 408 690L440 900" fill="#b7a38b"/><path d="M465 900V690Q485 530 615 540Q745 535 770 690L800 900" fill="url(#coat)"/><ellipse cx="258" cy="485" rx="98" ry="118" fill="#d8b79d"/><ellipse cx="614" cy="482" rx="100" ry="122" fill="#c79f83"/><path d="M159 490Q133 342 260 336Q391 342 355 488Q326 406 254 408Q185 405 159 490" fill="#4b4038"/><path d="M509 479Q496 345 608 337Q735 347 716 490Q668 414 594 408Q535 410 509 479" fill="#554339"/><path d="M343 900V765Q358 656 453 653Q558 660 580 775L598 900" fill="#6d8272"/><ellipse cx="463" cy="650" rx="75" ry="86" fill="#dfb99c"/><path d="M387 646Q379 546 457 546Q537 548 536 650Q494 602 446 604Q408 608 387 646" fill="#5e4d3d"/><path d="M65 900Q190 806 345 890M553 900Q705 806 850 880" fill="none" stroke="#ddd5c3" stroke-width="24" opacity=".3"/></g><rect width="900" height="900" fill="#f2d8af" opacity=".1"/></svg>`;
const sampleUrl='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sampleSvg);
function imageFromUrl(src:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Unable to decode image'));im.src=src;});}
function rand(seed:number){let t=seed+0x6D2B79F5;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
function leaf(c:CanvasRenderingContext2D,x:number,y:number,angle:number,length:number,width:number,color:string,alpha=.85){c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(width,-length*.35,width*.7,-length*.83,0,-length);c.bezierCurveTo(-width*.8,-length*.78,-width,-length*.3,0,0);c.fill();c.strokeStyle='#59735a66';c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.lineTo(0,-length*.9);c.stroke();c.restore();}
function spray(c:CanvasRenderingContext2D,x:number,y:number,angle:number,scale:number,seed:number){c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);c.strokeStyle='#526b4c';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.bezierCurveTo(0,-120,35,-270,20,-420);c.stroke();for(let i=0;i<20;i++){let yy=-20-i*19;let xx=8*Math.sin(i*.6);let spread=44+30*Math.sin(i/20*Math.PI);for(let side of [-1,1]){c.strokeStyle=i%3===0?'#708d69':'#385d47';c.lineWidth=2.5;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+side*spread*(.6+rand(seed+i)*.45),yy-33-rand(seed+i+19)*27);c.stroke();for(let j=0;j<4;j++){let bx=xx+side*spread*(.2+j*.2);let by=yy-(14+j*9);leaf(c,bx,by,side*.75,27+rand(seed+i+j)*14,4.5,i%4===0?'#8b9f80':'#4f7958',.76)}}}c.restore();}
function berry(c:CanvasRenderingContext2D,x:number,y:number,r:number){c.fillStyle='#9b333b';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.fillStyle='#d18b82';c.beginPath();c.arc(x-r*.28,y-r*.32,r*.23,0,Math.PI*2);c.fill();}
function ribbon(c:CanvasRenderingContext2D,x:number,y:number,angle:number,s:number){c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);c.globalAlpha=.91;c.fillStyle='#a5464a';c.beginPath();c.moveTo(-15,4);c.bezierCurveTo(-70,55,-90,145,-135,218);c.lineTo(-55,198);c.bezierCurveTo(-12,118,3,50,4,18);c.fill();c.fillStyle='#c26a64';c.beginPath();c.moveTo(15,3);c.bezierCurveTo(65,50,90,120,130,200);c.lineTo(52,190);c.bezierCurveTo(24,117,1,55,-5,18);c.fill();c.fillStyle='#b34e52';c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-72,-94,-140,-90,-150,-31);c.bezierCurveTo(-161,24,-71,33,0,0);c.bezierCurveTo(67,-91,140,-79,146,-29);c.bezierCurveTo(151,30,72,32,0,0);c.fill();c.fillStyle='#873b42';c.beginPath();c.ellipse(0,0,29,24,-.1,0,Math.PI*2);c.fill();c.restore();}
function textFit(c:CanvasRenderingContext2D,text:string,field:TextField,fontFamily:string,weight='normal'){let size=field.maxFont;while(size>field.minFont){c.font=`${weight} ${size}px ${fontFamily}`;if(c.measureText(text).width<=field.maxWidth)break;size-=2;}return size;}
function getGreeting(){return $('greeting') instanceof HTMLSelectElement && ($<HTMLSelectElement>('greeting').value==='custom')?$<HTMLInputElement>('customGreeting').value.trim():$<HTMLSelectElement>('greeting').value;}
let watercolor:HTMLImageElement|null=null;
// Transparent watercolor pigment extracted from the original botanical art.
// Rendered above the photo using the same 1500x2100 coordinates in preview and export.
let foreground:HTMLImageElement|null=null;
function ornament(c:CanvasRenderingContext2D,x:number,y:number,s:number,flip=1){
 c.save();c.translate(x,y);c.scale(s*flip,s);
 c.strokeStyle='#63765a';c.lineWidth=5;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(30,-55,12,-105,50,-168);c.stroke();
 for(let i=0;i<5;i++){let px=8+i*8,py=-22-i*30;leaf(c,px,py,-.9,68,19,i%2?'#8a9d78':'#536f59',.82);leaf(c,px,py,.85,59,16,'#a0a98c',.82);}
 berry(c,48,-94,12);berry(c,72,-110,11);berry(c,67,-75,10);c.restore();
}
function artwork(c:CanvasRenderingContext2D){
 c.save();
 if(TEMPLATE.id==='classic'){
  // A balanced botanical arch with a crimson ribbon at the crown.
  spray(c,145,590,-.65,.82,10);spray(c,1355,590,.65,.82,30);
  spray(c,155,1430,-.14,.66,50);spray(c,1345,1430,.14,.66,70);
  ornament(c,145,1040,1.1);ornament(c,1355,1040,1.1,-1);
  ribbon(c,750,160,0,.85);
 }else if(TEMPLATE.id==='garland'){
  // The photo is crowned by a curved winter garland and finished with a bow below.
  spray(c,500,555,-1.05,.72,11);spray(c,1000,555,1.05,.72,21);
  spray(c,220,900,-.18,.55,31);spray(c,1280,900,.18,.55,41);
  ornament(c,160,1430,1.25);ornament(c,1340,1430,1.25,-1);
  ribbon(c,750,1710,0,.67);
  ornament(c,480,505,.58);ornament(c,1020,505,.58,-1);
 }else{
  // Asymmetrical large ribbon and trailing branches, anchored bottom-right.
  spray(c,180,565,-.65,1.05,13);spray(c,1370,880,.12,.88,23);
  spray(c,1220,1600,.82,.92,33);spray(c,440,1680,-.7,.56,43);
  ornament(c,140,1000,1.2);ornament(c,1350,1210,1.1,-1);
  ribbon(c,1160,200,.34,1.03);
 }
 for(const [x,y] of TEMPLATE.id==='garland'?[[165,730],[1335,730],[185,1510],[1315,1510]]: [[175,520],[1325,520],[160,1380],[1340,1380]]){
  berry(c,x,y,13);berry(c,x+21,y-19,10);berry(c,x-18,y-23,11);
 }
 c.restore();
}
function oval(c:CanvasRenderingContext2D,s:Slot,pad=0){c.beginPath();c.ellipse(s.x+s.width/2,s.y+s.height/2,s.width/2+pad,s.height/2+pad,0,0,Math.PI*2);}
function render(c:CanvasRenderingContext2D,w:number,h:number,photo:CanvasImageSource|null,isSample=false){
 const k=w/TEMPLATE.width;c.save();c.setTransform(k,0,0,k,0,0);c.clearRect(0,0,1500,2100);
 c.fillStyle='#f7f0e4';c.fillRect(0,0,1500,2100);
 // Gentle paper grain, consistent across preview and exports.
 for(let i=0;i<2000;i++){const x=rand(i*13+9)*1500,y=rand(i*19+7)*2100;c.fillStyle=i%3?'#b6a68a12':'#fffaf21a';c.fillRect(x,y,2,2);}
 const slot=TEMPLATE.photoSlots[0];c.fillStyle='#e8e0d2';oval(c,slot,21);c.fill();
 c.save();oval(c,slot);c.clip();c.fillStyle='#a9b7a6';c.fillRect(slot.x,slot.y,slot.width,slot.height);
 if(photo){const pw=isSample?900:photoWidth,ph=isSample?900:photoHeight;const base=Math.max(slot.width/pw,slot.height/ph);const z=isSample?1:zoom;const dw=pw*base*z,dh=ph*base*z;const dx=slot.x+(slot.width-dw)/2+(isSample?0:offsetX),dy=slot.y+(slot.height-dh)/2+(isSample?0:offsetY);c.drawImage(photo,dx,dy,dw,dh);}
 else {c.fillStyle='#f6efe5';c.textAlign='center';c.font='52px Georgia';c.fillText('Your favorite moment',750,1100);}
 c.restore();
 c.strokeStyle='#f9f5e9';c.lineWidth=21;oval(c,slot,11);c.stroke();
 artwork(c);
 const greeting=getGreeting();const family=$<HTMLInputElement>('family').value.trim();const year=$<HTMLInputElement>('showYear').checked?$<HTMLInputElement>('year').value.trim():'';
 c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle='#293d31';
 const serif='"Cormorant Garamond", Georgia, serif';
 const greetingText=greeting.toLocaleUpperCase();let fs=textFit(c,greetingText,TEMPLATE.texts.greeting,serif,'600');c.font=`600 ${fs}px ${serif}`;
 c.fillText(greetingText,750,TEMPLATE.texts.greeting.y,TEMPLATE.texts.greeting.maxWidth);
 c.fillStyle='#8b2630';c.font='43px Georgia';c.fillText('✦',750,TEMPLATE.texts.greeting.y+78);
 c.fillStyle='#293d31';const familyText=family.toLocaleUpperCase();let familySize=textFit(c,familyText,TEMPLATE.texts.family,serif,'600');c.font=`600 ${familySize}px ${serif}`;c.fillText(familyText,750,TEMPLATE.texts.family.y,TEMPLATE.texts.family.maxWidth);
 if(year){c.font=`600 59px ${serif}`;c.fillText(year,750,TEMPLATE.texts.year.y);}
 c.strokeStyle='#b89c69';c.lineWidth=2;c.beginPath();c.moveTo(510,year?2040:1940);c.lineTo(990,year?2040:1940);c.stroke();
 c.restore();
}
function clampOffsets(){if(!uploaded)return;const s=TEMPLATE.photoSlots[0],base=Math.max(s.width/photoWidth,s.height/photoHeight);const dw=photoWidth*base*zoom,dh=photoHeight*base*zoom;offsetX=Math.max(-(dw-s.width)/2,Math.min((dw-s.width)/2,offsetX));offsetY=Math.max(-(dh-s.height)/2,Math.min((dh-s.height)/2,offsetY));}
function update(){clampOffsets();render(ctx,750,1050,uploaded||sample,!uploaded);const greeting=getGreeting(),family=$<HTMLInputElement>('family').value.trim(),year=$<HTMLInputElement>('year').value.trim();const ready=!!uploaded&&!!greeting&&!!family&&(!$<HTMLInputElement>('showYear').checked||/^\d{4}$/.test(year));$<HTMLButtonElement>('downloadPng').disabled=!ready;$<HTMLButtonElement>('downloadPdf').disabled=!ready;$('readyHint').textContent=ready?'Ready! Your print files are prepared locally when you download.':!uploaded?'Add your own photo to unlock downloads.':!greeting||!family?'Complete the greeting and family name to download.':'Enter a valid four-digit year or turn off the year.';$('familyCount').textContent=`${$<HTMLInputElement>('family').value.length}/${TEMPLATE.texts.family.maxChars}`;$('greetingCount').textContent=`${$<HTMLInputElement>('customGreeting').value.length}/${TEMPLATE.texts.greeting.maxChars}`;if(uploaded){const slot=TEMPLATE.photoSlots[0],base=Math.max(slot.width/photoWidth,slot.height/photoHeight);const effective=1/(base*zoom);const sourceW=slot.width*effective,sourceH=slot.height*effective;const low=Math.min(sourceW/slot.width,sourceH/slot.height)*300;const warn=$('resolutionWarning');warn.hidden=low>=250;warn.textContent=`Print quality warning: this crop provides about ${Math.round(low)} pixels per inch. For a sharper print, use a higher-resolution photo or zoom out.`;}}
async function setPhoto(file:File){const error=$('photoError');error.hidden=true;const accepted=['image/jpeg','image/png','image/webp'];if(!accepted.includes(file.type)){error.textContent='Unsupported file. Choose a JPEG, PNG, or WebP photo.';error.hidden=false;return;}if(file.size>40*1024*1024){error.textContent='This file is over 40 MB. Choose a smaller photo and try again.';error.hidden=false;return;}try{let source:CanvasImageSource;let w:number,h:number;const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});source=bitmap;w=bitmap.width;h=bitmap.height;if(w<1||h<1)throw Error('Empty image');if(uploaded instanceof ImageBitmap)uploaded.close();uploaded=source;photoWidth=w;photoHeight=h;zoom=1;offsetX=0;offsetY=0;$<HTMLInputElement>('zoom').value='100';$('zoomValue').textContent='100%';$('photoTools').hidden=false;$('uploadTitle').textContent=file.name;$('uploadSubtitle').textContent=`${w} × ${h} pixels · Photo loaded`;$('replaceButton').textContent='Replace photo ↗';update();}catch(e){error.textContent='We could not open that photo. Try saving it as a new JPG or PNG, then upload it again.';error.hidden=false;}}
function exportCanvas(){const canvas=document.createElement('canvas');canvas.width=TEMPLATE.width;canvas.height=TEMPLATE.height;const c=canvas.getContext('2d')!;render(c,canvas.width,canvas.height,uploaded);return canvas;}
function saveBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
// Minimal standards-compliant one-page PDF writer; exact MediaBox 360 × 504 points.
function makePdf(jpeg:ArrayBuffer,pixelWidth:number,pixelHeight:number){const enc=new TextEncoder();const parts:Uint8Array[]=[];let length=0;const offsets:number[]=[0];const add=(data:string|Uint8Array)=>{const bytes=typeof data==='string'?enc.encode(data):data;parts.push(bytes);length+=bytes.length;};add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');const object=(n:number,body:string|Uint8Array)=>{offsets[n]=length;add(`${n} 0 obj\n`);add(body);add('\nendobj\n');};object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 360 504] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');offsets[4]=length;add('4 0 obj\n');add(`<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.byteLength} >>\nstream\n`);add(new Uint8Array(jpeg));add('\nendstream\nendobj\n');const stream='q\n360 0 0 504 0 0 cm\n/Im0 Do\nQ\n';object(5,`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}endstream`);const xref=length;add('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)add(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);return new Blob(parts as BlobPart[],{type:'application/pdf'});}
function canvasBlob(canvas:HTMLCanvasElement,type:string,quality?:number){return new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Export failed')),type,quality));}
function chooseTemplate(id:string,scroll=true){
 TEMPLATE=templates[id];zoom=1;offsetX=offsetY=0;
 $<HTMLInputElement>('zoom').value='100';$('zoomValue').textContent='100%';
 $('selectedTemplate').textContent=TEMPLATE.name;
 document.querySelectorAll<HTMLButtonElement>('[data-template]').forEach(b=>{const selected=b.dataset.template===id;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);});
 render(landCtx,750,1050,sample,true);update();
 if(scroll)document.getElementById('studio')!.scrollIntoView({behavior:'smooth'});
}
function bind(){document.querySelectorAll<HTMLButtonElement>('[data-template]').forEach(b=>b.addEventListener('click',()=>chooseTemplate(b.dataset.template!)));
 const start=()=>{document.getElementById('collection')!.scrollIntoView({behavior:'smooth'});};$('heroStart').addEventListener('click',start);$<HTMLInputElement>('photoInput').addEventListener('change',e=>{const file=(e.target as HTMLInputElement).files?.[0];if(file)void setPhoto(file);});const drop=$('dropzone');drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragover')});drop.addEventListener('dragleave',()=>drop.classList.remove('dragover'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragover');const file=e.dataTransfer?.files[0];if(file)void setPhoto(file);});$<HTMLInputElement>('zoom').addEventListener('input',e=>{zoom=Number((e.target as HTMLInputElement).value)/100;$('zoomValue').textContent=`${Math.round(zoom*100)}%`;update();});$('resetCrop').addEventListener('click',()=>{zoom=1;offsetX=offsetY=0;$<HTMLInputElement>('zoom').value='100';$('zoomValue').textContent='100%';update();});for(const [id,dx,dy] of [['moveLeft',-35,0],['moveRight',35,0],['moveUp',0,-35],['moveDown',0,35]] as const){$(id).addEventListener('click',()=>{offsetX+=dx;offsetY+=dy;update();});}const greet=$<HTMLSelectElement>('greeting');greet.addEventListener('change',()=>{$('customWrap').hidden=greet.value!=='custom';update();});for(const id of ['customGreeting','family','year','showYear'])$(id).addEventListener('input',update);$('startOver').addEventListener('click',()=>{if(uploaded instanceof ImageBitmap)uploaded.close();uploaded=null;photoWidth=photoHeight=0;zoom=1;offsetX=offsetY=0;$<HTMLInputElement>('photoInput').value='';$<HTMLInputElement>('zoom').value='100';$('zoomValue').textContent='100%';$('photoTools').hidden=true;$('photoError').hidden=true;$('uploadTitle').textContent='Choose your family photo';$('uploadSubtitle').textContent='JPG, PNG or WebP · Drag & drop or tap to browse';$('replaceButton').textContent='Browse photos ↗';greet.value='Happy Holidays';$('customWrap').hidden=true;$<HTMLInputElement>('customGreeting').value='';$<HTMLInputElement>('family').value='The Anderson Family';$<HTMLInputElement>('year').value='';$<HTMLInputElement>('showYear').checked=false;update();});let drag:{x:number;y:number;ox:number;oy:number}|null=null;editor.addEventListener('pointerdown',e=>{if(!uploaded)return;const rect=editor.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width*1500,y=(e.clientY-rect.top)/rect.height*2100;const s=TEMPLATE.photoSlots[0];if(x<s.x||x>s.x+s.width||y<s.y||y>s.y+s.height)return;drag={x:e.clientX,y:e.clientY,ox:offsetX,oy:offsetY};editor.setPointerCapture(e.pointerId);});editor.addEventListener('pointermove',e=>{if(!drag)return;const rect=editor.getBoundingClientRect();offsetX=drag.ox+(e.clientX-drag.x)/rect.width*1500;offsetY=drag.oy+(e.clientY-drag.y)/rect.height*2100;update();});for(const ev of ['pointerup','pointercancel','lostpointercapture'])editor.addEventListener(ev,()=>drag=null);$('downloadPng').addEventListener('click',async()=>{try{saveBlob(await canvasBlob(exportCanvas(),'image/png'),`${TEMPLATE.id}-5x7.png`);}catch{alert('PNG export failed. Please try again in another browser.');}});$('downloadPdf').addEventListener('click',async()=>{try{const canvas=exportCanvas();const blob=await canvasBlob(canvas,'image/jpeg',.97);saveBlob(makePdf(await blob.arrayBuffer(),canvas.width,canvas.height),`${TEMPLATE.id}-5x7.pdf`);}catch{alert('PDF export failed. Please try again in another browser.');}});}
void Promise.all([imageFromUrl(sampleUrl),document.fonts.ready]).then(([im])=>{sample=im;bind();chooseTemplate('classic',false);drawGallery();}).catch(()=>{bind();update();});

function drawGallery(){for(const [id,template] of Object.entries(templates)){
 const canvas=document.getElementById(`card-${id}`) as HTMLCanvasElement|null;
 if(!canvas)continue;const previous=TEMPLATE;TEMPLATE=template;
 render(canvas.getContext('2d')!,canvas.width,canvas.height,sample,true);TEMPLATE=previous;
}}
