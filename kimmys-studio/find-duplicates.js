const fs = require('fs');

// Load all data
const meals = JSON.parse(fs.readFileSync('meals-export.json'));
const combos = JSON.parse(fs.readFileSync('combos-export.json'));
const mealRefs = JSON.parse(fs.readFileSync('meal-refs.json')).map(r => r._ref);
const orderRefs = JSON.parse(fs.readFileSync('order-refs.json')).map(r => r._ref);

// Combine all references
const allRefs = [...new Set([...mealRefs, ...orderRefs])];

// Find meal duplicates
const mealNames = {};
meals.forEach(meal => {
  mealNames[meal.name] = [...(mealNames[meal.name] || []), meal._id];
});

// Generate delete commands
let commands = [];
Object.entries(mealNames).forEach(([name, ids]) => {
  if (ids.length > 1) {
    // Keep at least one version (prefer referenced ones)
    const [keep, ...remove] = ids.sort((a,b) => 
      allRefs.includes(b) - allRefs.includes(a)
    );
    remove.forEach(id => commands.push(`sanity documents delete "${id}"`));
  }
});

// Save to file
fs.writeFileSync('cleanup.sh', commands.join('\n'));
console.log(`Generated ${commands.length} delete commands in cleanup.sh`);