/*
 * Yar Keshavarz - Unified Brain Entry Point
 *
 * This module does not invent new agricultural data. It exposes the existing
 * knowledge layers already present in this project through one entry point.
 */
import agricultureDB from './agriculture-db-extended.js';
import globalBrain from './global-agriculture-brain.js';
import cropProfiles from './crop-profiles.js';
import universalProfiles from './crop-profiles-universal.js';
import specializedProfiles from './specialized-crop-profiles.js';
import cropRegistry, { GROUPS, aliases, normalize } from './global-crop-registry.js';
import { extractEntities } from './intent-engine.js';
import { remember, contextHint } from './context-engine.js';
import { findOfflineAnswer, searchKnowledge, findCropProfileAnswer } from './offline-ai.js';
import calculators from './calculators.js';

export const YAR_KESHAAVARZ_BRAIN = {
  agricultureDB,
  globalBrain,
  cropProfiles,
  universalProfiles,
  specializedProfiles,
  cropRegistry,
  GROUPS,
  aliases,
  normalize,
  extractEntities,
  remember,
  contextHint,
  findOfflineAnswer,
  searchKnowledge,
  findCropProfileAnswer,
  calculators
};

export {
  agricultureDB,
  globalBrain,
  cropProfiles,
  universalProfiles,
  specializedProfiles,
  cropRegistry,
  GROUPS,
  aliases,
  normalize,
  extractEntities,
  remember,
  contextHint,
  findOfflineAnswer,
  searchKnowledge,
  findCropProfileAnswer,
  calculators
};

export default YAR_KESHAAVARZ_BRAIN;
