// variableUtils.ts

import { hexToRgb } from '../utils/colorUtils';

// Function to create variables dynamically for Figma
export async function createFigmaVariable(name: string, value: string, primitivesCollection: any) {
  const variable = figma.variables.createVariable(name, primitivesCollection, 'COLOR');
  variable.setValueForMode(primitivesCollection.modes[0].modeId, hexToRgb(value));
  return variable;
}

// Function to create color variables for each palette
export async function createPaletteVariables(palette: string[], baseName: string, primitivesCollection: any) {
  const lightnessLevels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  
  palette.forEach((color, index) => {
    const lightnessLevel = lightnessLevels[index];
    const colorName = `${baseName}/${lightnessLevel}`;
    createFigmaVariable(colorName, color, primitivesCollection);
  });
}
