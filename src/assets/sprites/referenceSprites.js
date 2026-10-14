// Original reference images remain intact. Only the connected white backdrop is
// masked at runtime; white eyes, shirts and faces enclosed by outlines survive.
export const REFERENCE_URLS = {
  joker: new URL('./joker_reference.png', import.meta.url).href,
  batman: new URL('./batman_reference.png', import.meta.url).href,
  penguin: new URL('./penguin_reference.png', import.meta.url).href,
  scarecrow: new URL('./scarecrow_reference.png', import.meta.url).href,
  two_face: new URL('./two_face_reference.png', import.meta.url).href,
  harley_quinn: new URL('./harley_quinn_reference.png', import.meta.url).href,
};
export const ART_ASSET_URLS = {
  batarang: new URL('./batarang_reference.png', import.meta.url).href,
  bat_logo: new URL('./bat_logo_reference.png', import.meta.url).href,
};
const references = new Map();
const tinted = new Map();
let loading;

export function maskBackdrop(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0, tail = 0;
  const add = (pixel) => {
    if (visited[pixel]) return;
    visited[pixel] = 1;
    const i = pixel * 4;
    if (data[i + 3] === 0 || (Math.min(data[i], data[i + 1], data[i + 2]) >= 235 &&
        Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) < 16)) {
      queue[tail++] = pixel;
    }
  };
  for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { add(y * width); add(y * width + width - 1); }
  while (head < tail) {
    const p = queue[head++], x = p % width, y = Math.floor(p / width);
    data[p * 4 + 3] = 0;
    if (x > 0) add(p - 1);
    if (x < width - 1) add(p + 1);
    if (y > 0) add(p - width);
    if (y < height - 1) add(p + width);
  }
}

export function prepareReferenceSprites() {
  if (!globalThis.document) return Promise.resolve();
  if (loading) return loading;
  loading = Promise.all(Object.entries({...REFERENCE_URLS,...ART_ASSET_URLS}).map(async ([key, url]) => {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    maskBackdrop(pixels.data, canvas.width, canvas.height);
    ctx.putImageData(pixels, 0, 0);
    let left=canvas.width, top=canvas.height, right=0, bottom=0;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++) {
      if(pixels.data[(y*canvas.width+x)*4+3]===0)continue;
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    references.set(key,{canvas,left,top,width:right-left+1,height:bottom-top+1});
  }));
  return loading;
}

export function drawReference(ctx, key, height, phase, action) {
  const image = references.get(key);
  if (!image) return false;
  const width = height * image.width / image.height;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // All states keep the same foot anchor. Motion is layered on the supplied art.
  if(action==='idle')ctx.scale(1,1+Math.sin(phase)*0.012);
  if(action==='walk') {
    ctx.rotate(Math.sin(phase)*0.045);
    const stride = Math.sin(phase);
    const cut = Math.floor(image.height * 0.72);
    const legHeight = image.height - cut;
    const bodyHeight = height * cut / image.height;
    const footHeight = height - bodyHeight;
    const split = Math.floor(image.width / 2);
    ctx.drawImage(image.canvas, image.left, image.top, image.width, cut + 2,
      -width/2, -height, width, bodyHeight + height*2/image.height);
    for (let side=0;side<2;side++) {
      const sx = side === 0 ? 0 : split;
      const sw = side === 0 ? split : image.width - split;
      const step = stride * (side === 0 ? 1 : -1);
      ctx.drawImage(image.canvas,image.left+sx,image.top+cut,sw,legHeight,
        -width/2+width*sx/image.width+step*height*0.022,
        -footHeight-Math.max(0,step)*height*0.028,width*sw/image.width,footHeight);
    }
    ctx.restore();
    return true;
  }
  if(action==='attack') {ctx.translate(Math.sin(phase/2)*5,0);ctx.rotate(Math.sin(phase/2)*0.055);}
  ctx.drawImage(image.canvas,image.left,image.top,image.width,image.height,-width/2,-height,width,height);
  ctx.restore();
  return true;
}

// Weapon and logo use their own supplied artwork, with a uniform fit.
export function drawAsset(ctx, key, maxWidth, maxHeight, color = null) {
  const asset = references.get(key);
  if (!asset) return false;
  let source = asset.canvas;
  let left = asset.left, top = asset.top;
  if (color) {
    const id = key + color;
    if (!tinted.has(id)) {
      const canvas = document.createElement('canvas');
      canvas.width=asset.width;canvas.height=asset.height;
      const paint=canvas.getContext('2d');
      paint.drawImage(source,left,top,asset.width,asset.height,0,0,asset.width,asset.height);
      paint.globalCompositeOperation='source-in';paint.fillStyle=color;
      paint.fillRect(0,0,canvas.width,canvas.height);
      tinted.set(id,canvas);
    }
    source=tinted.get(id);left=top=0;
  }
  const scale=Math.min(maxWidth/asset.width,maxHeight/asset.height);
  const width=asset.width*scale,height=asset.height*scale;
  ctx.drawImage(source,left,top,asset.width,asset.height,-width/2,-height/2,width,height);
  return true;
}
