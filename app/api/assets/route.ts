import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const assetsPath = path.join(process.cwd(), 'public', 'assets', 'character')
    
    // Define the folder structure
    const folderStructure = {
      'body/body': 'body',
      'body/clothes': 'clothes', 
      'hair/hair-behind': 'hairBehind',
      'hair/hair-front': 'hairFront',
      'face/eyes': 'eyes',
      'face/eyebrows': 'eyebrows',
      'face/mouth': 'mouth',
      'face/blush': 'blush',
      'accessories/earring': 'earring',
      'accessories/glasses': 'glasses',
    }

    const scannedAssets: Record<string, string[]> = {}

    // Scan each folder for PNG files
    for (const [folderPath, partKey] of Object.entries(folderStructure)) {
      const fullFolderPath = path.join(assetsPath, folderPath)
      
      try {
        if (fs.existsSync(fullFolderPath)) {
          const files = fs.readdirSync(fullFolderPath)
          const pngFiles = files.filter(file => 
            file.toLowerCase().endsWith('.png') && 
            fs.statSync(path.join(fullFolderPath, file)).isFile()
          )
          scannedAssets[partKey] = pngFiles
        } else {
          scannedAssets[partKey] = []
        }
      } catch (error) {
        console.warn(`Could not scan folder ${fullFolderPath}:`, error)
        scannedAssets[partKey] = []
      }
    }

    return NextResponse.json({ assets: scannedAssets })
  } catch (error) {
    console.error('Error scanning assets:', error)
    return NextResponse.json({ error: 'Failed to scan assets' }, { status: 500 })
  }
}
