/**
 * @file SoundManager.js
 * Adapter re-exporting AudioManager from the dedicated src/audio/ folder.
 */

import { AudioManager } from '../audio/AudioManager.js';

export class SoundManager extends AudioManager {}
export default SoundManager;
