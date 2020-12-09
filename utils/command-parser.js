const config = require('config');
const path = require('path');
const { Glossary } = require(path.resolve(config.get('story-teller').glossary));

/**
 * @param {string} args Elendil --channel=Men of the West 
 * @returns {Object} query 
 * @returns {string} query.text Query to pass to the search algorithm
 * @returns {Object} query.options Options object to be defined
 */
module.exports = function(args) {
  let query = {};
  query.text = parseQuery(args);
  query.options = parseFlags(args);
  
  if (query.text == 'utellme') {
    query.text = Glossary[Math.floor(Math.random() * Glossary.length)];
  }

  return query;
}

function parseFlags(text) {
  pattern = /[-][-](\w+)[=]([^-]*)/g;
  let flagMatches = [...text.matchAll(pattern)];
  let flagNames = Array.from(flagMatches, f => f[1]);
  let flagValues = Array.from(flagMatches, f => f[2]);
  let flags = {};

  for (let i = 0; i < flagMatches.length; i++) {
    flags[flagNames[i]] = flagValues[i];
  }

  return flags;
}

function parseQuery(text) {
  pattern = /.+?(?=\s--)/g;
  // Ugly fix, find the right patter pls
  if (!text.includes('--')) text += ' --';

  return text.match(pattern)[0]; // 0 has the first conrrespondence
}