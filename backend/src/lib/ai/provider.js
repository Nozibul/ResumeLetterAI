/**
 * @file provider.js
 * @description Public entry point for AI cover-letter generation. Thin
 * re-export of the orchestrator — CoverLetterService should only ever
 * import from this file, never from orchestrator.js or any adapter
 * directly, so internal wiring can change without touching callers.
 * @module lib/ai/provider
 * @author Nozibul Islam
 * @version 2.0.0
 */

const { generateCoverLetter } = require('./orchestrator');

module.exports = { generateCoverLetter };
