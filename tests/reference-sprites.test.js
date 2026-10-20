import test from 'node:test';
import assert from 'node:assert/strict';
import {maskBackdrop,REFERENCE_URLS} from '../src/views/sprites/referenceSprites.js';

test('reference mask removes external white but keeps enclosed white costume details',()=>{
 const pixels=new Uint8ClampedArray(5*5*4).fill(255);
 for(let y=1;y<=3;y++)for(let x=1;x<=3;x++)if(x!==2||y!==2){
  const i=(y*5+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=0;
 }
 maskBackdrop(pixels,5,5);
 assert.equal(pixels[3],0);
 assert.equal(pixels[(2*5+2)*4+3],255);
 assert.equal(pixels[(1*5+1)*4+3],255);
});

test('all six supplied characters have their corresponding local sprite asset',()=>{
 assert.deepEqual(Object.keys(REFERENCE_URLS).sort(),['batman','harley_quinn','joker','penguin','scarecrow','two_face']);
 for(const [key,url] of Object.entries(REFERENCE_URLS))assert.ok(url.endsWith(key+'_reference.png'));
});
