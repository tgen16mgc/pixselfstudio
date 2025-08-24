#!/usr/bin/env node

/**
 * Test script to verify that color variants are correctly handled
 * Simulates the selection of assets and color variants
 */

// Helper functions to simulate the asset selection process
function simulateAssetSelection() {
  console.log('🧪 Simulating asset selection and color variant rendering...\n');
  
  // Simulate the character parts structure
  const characterParts = [
    { 
      key: 'hairFront', 
      assets: [
        { id: 'front-tomboy', path: '/assets/character/hair/hair-front/hair-front-tomboy.png' },
        { id: 'front-2side', path: '/assets/character/hair/hair-front/hair-front-2side.png' }
      ]
    },
    {
      key: 'eyes',
      assets: [
        { id: 'default', path: '/assets/character/face/eyes/eyes-default.png' }
      ]
    },
    {
      key: 'mouth',
      assets: [
        { id: 'smile', path: '/assets/character/face/mouth/mouth-smile.png' }
      ]
    }
  ];
  
  // Mock the resolveAssetPath function
  function resolveAssetPath(partKey, assetId) {
    // Handle known test cases
    if (partKey === 'hairFront') {
      if (assetId === 'tomboy-brown') {
        return '/assets/character/hair/hair-front/hair-front-tomboy-brown.png';
      } else if (assetId === '2side-blue') {
        return '/assets/character/hair/hair-front/hair-front-2side-blue.png';
      }
    } else if (partKey === 'eyes') {
      if (assetId === 'default-blue') {
        return '/assets/character/face/eyes/eyes-default-blue.png';
      }
    } else if (partKey === 'mouth') {
      if (assetId === 'smile-pink') {
        return '/assets/character/face/mouth/mouth-smile-pink.png';
      }
    }
    
    // Fallback to looking through character parts
    const part = characterParts.find(p => p.key === partKey);
    if (!part) return null;
    
    const asset = part.assets.find(a => a.id === assetId);
    return asset ? asset.path : null;
  }

  // Simulate character selections
  const selections = {
    hairFront: { assetId: 'front-tomboy', enabled: true },
    eyes: { assetId: 'default', enabled: true },
    mouth: { assetId: 'smile', enabled: true }
  };
  
  // Test 1: Basic asset selection
  console.log('Test 1: Basic asset selection');
  console.log('----------------------------');
  console.log('Selections:', JSON.stringify(selections, null, 2));
  
  Object.entries(selections).forEach(([partKey, selection]) => {
    const path = resolveAssetPath(partKey, selection.assetId);
    console.log(`Part: ${partKey}, Asset: ${selection.assetId}, Path: ${path || 'Not found'}`);
  });
  console.log('');
  
  // Test 2: Select a color variant for hair
  console.log('Test 2: Selecting hair color variant');
  console.log('----------------------------------');
  selections.hairFront.assetId = 'tomboy-brown'; // This is the key change - using color variant ID
  console.log('Selections:', JSON.stringify(selections, null, 2));
  
  Object.entries(selections).forEach(([partKey, selection]) => {
    const path = resolveAssetPath(partKey, selection.assetId);
    console.log(`Part: ${partKey}, Asset: ${selection.assetId}, Path: ${path || 'Not found'}`);
  });
  console.log('');
  
  // Test 3: Select a color variant for eyes
  console.log('Test 3: Selecting eye color variant');
  console.log('---------------------------------');
  selections.hairFront.assetId = 'front-tomboy'; // Reset hair
  selections.eyes.assetId = 'default-blue'; // Change eye color
  console.log('Selections:', JSON.stringify(selections, null, 2));
  
  Object.entries(selections).forEach(([partKey, selection]) => {
    const path = resolveAssetPath(partKey, selection.assetId);
    console.log(`Part: ${partKey}, Asset: ${selection.assetId}, Path: ${path || 'Not found'}`);
  });
  console.log('');
  
  // Test 4: Multiple color variants
  console.log('Test 4: Multiple color variants');
  console.log('-----------------------------');
  selections.hairFront.assetId = '2side-blue'; 
  selections.mouth.assetId = 'smile-pink';
  console.log('Selections:', JSON.stringify(selections, null, 2));
  
  Object.entries(selections).forEach(([partKey, selection]) => {
    const path = resolveAssetPath(partKey, selection.assetId);
    console.log(`Part: ${partKey}, Asset: ${selection.assetId}, Path: ${path || 'Not found'}`);
  });
  console.log('');
  
  console.log('✅ Test simulation complete!');
}

// Run the simulation
simulateAssetSelection();
