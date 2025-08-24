"use client";

import { resolveAssetPath } from '@/utils/asset-path-resolver';
import { useState } from 'react';
import type { PartKey, StyleInfo } from '@/types/character';

type PartMap<T> = Record<PartKey, T>;

/**
 * Test page for color variants system
 */
export default function TestColorVariants() {
  const [selectedPart, setSelectedPart] = useState<PartKey>('hairFront');
  const [selectedStyle, setSelectedStyle] = useState('tomboy');
  const [selectedColor, setSelectedColor] = useState('');
  
  // List of testable parts
  const parts = [
    { key: 'hairFront' as PartKey, name: 'Hair (Front)' },
    { key: 'hairBehind' as PartKey, name: 'Hair (Behind)' },
    { key: 'eyes' as PartKey, name: 'Eyes' },
    { key: 'mouth' as PartKey, name: 'Mouth' }
  ];
  
  // Styles for each part
  const stylesByPart: PartMap<StyleInfo[]> = {
    hairFront: [
      { id: 'tomboy', name: 'Tomboy' },
      { id: '2side', name: '2-Side' },
      { id: 'front-tomboy', name: 'Front Tomboy (with prefix)' },
    ],
    hairBehind: [
      { id: '2side', name: '2-Side' },
      { id: 'curly', name: 'Curly' },
    ],
    eyes: [
      { id: 'default', name: 'Default' },
      { id: 'basic1', name: 'Basic 1' },
    ],
    mouth: [
      { id: 'smile', name: 'Smile' },
      { id: 'small', name: 'Small' },
    ],
    body: [
      { id: 'default', name: 'Default' }
    ],
    clothes: [
      { id: 'default', name: 'Default' }
    ],
    blush: [
      { id: 'default', name: 'Default' }
    ],
    eyebrows: [
      { id: 'default', name: 'Default' }
    ],
    glasses: [
      { id: 'default', name: 'Default' }
    ],
    earring: [
      { id: 'default', name: 'Default' }
    ]
  };
  
  // Colors for each part
  const colorsByPart: PartMap<StyleInfo[]> = {
    hairFront: [
      { id: 'brown', name: 'Brown' },
      { id: 'blonde', name: 'Blonde' },
      { id: 'black', name: 'Black' },
      { id: 'blue', name: 'Blue' },
      { id: 'red', name: 'Red' },
      { id: 'purple', name: 'Purple' },
    ],
    hairBehind: [],
    eyes: [
      { id: 'blue', name: 'Blue' },
      { id: 'green', name: 'Green' },
    ],
    mouth: [
      { id: 'pink', name: 'Pink' },
    ],
    body: [],
    clothes: [],
    blush: [],
    eyebrows: [],
    glasses: [],
    earring: []
  };
  
  // Generate asset ID based on selected options
  const generateAssetId = () => {
    if (!selectedColor) {
      return selectedStyle;
    }
    return `${selectedStyle}-${selectedColor}`;
  };
  
  // Resolve the asset path
  const assetPath = resolveAssetPath(selectedPart, generateAssetId());
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Color Variants Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          
          {/* Part selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Part</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedPart}
              onChange={(e) => {
                const newPart = e.target.value as PartKey;
                setSelectedPart(newPart);
                setSelectedStyle(stylesByPart[newPart][0]?.id || '');
                setSelectedColor('');
              }}
            >
              {parts.map(part => (
                <option key={part.key} value={part.key}>{part.name}</option>
              ))}
            </select>
          </div>
          
          {/* Style selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Style</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
            >
              {stylesByPart[selectedPart]?.map((style: StyleInfo) => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>
          
          {/* Color selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Color Variant</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              <option value="">Default (No Color)</option>
              {colorsByPart[selectedPart]?.map((color: StyleInfo) => (
                <option key={color.id} value={color.id}>{color.name}</option>
              ))}
            </select>
          </div>
          
          {/* Asset ID display */}
          <div className="mt-6 p-3 bg-gray-200 rounded">
            <div className="text-sm font-medium">Generated Asset ID:</div>
            <div className="font-mono bg-white p-2 rounded mt-1">{generateAssetId()}</div>
          </div>
          
          {/* Asset Path display */}
          <div className="mt-4 p-3 bg-gray-200 rounded">
            <div className="text-sm font-medium">Resolved Asset Path:</div>
            <div className="font-mono bg-white p-2 rounded mt-1 break-all text-sm">
              {assetPath || 'No path resolved'}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Asset Preview</h2>
          
          <div className="flex items-center justify-center h-64 bg-white rounded border">
            {assetPath ? (
              <img 
                src={assetPath} 
                alt={`${selectedPart} - ${generateAssetId()}`}
                className="object-contain max-h-full"
              />
            ) : (
              <div className="text-gray-500">No asset available</div>
            )}
          </div>
          
          <div className="mt-4 text-sm">
            <strong>Note:</strong> This page tests if the asset path resolver correctly handles color variants
            with different naming conventions. When an image appears, it means the path resolver found the 
            correct file path for the selected asset ID.
          </div>
        </div>
      </div>
    </div>
  );
}
