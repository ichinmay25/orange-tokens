import { generateTintsAndShades } from './utils/colorUtils';
import { createPaletteVariables } from './figma/variableUtils';

interface ColorInputs {
  [key: string]: {
    hex: string;
    name: string;
  };
}

// Function to validate hex color input
function isValidHexColor(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
}

// Function to create local variables dynamically based on user input
async function createLocalVariables(colorInputs: ColorInputs) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  // Find or create the 'Primitives' collection
  let primitivesCollection = collections.find(collection => collection.name === 'Primitives');
  if (!primitivesCollection) {
    primitivesCollection = figma.variables.createVariableCollection('Primitives');
  }

  let variablesCreated = false; // Flag to track if any variables are created

  try {
    // Fetch all the variable IDs from the 'Primitives' collection
    const variableIds = primitivesCollection.variableIds;

    // Fetch all variables in the 'Primitives' collection
    const existingVariables = await figma.variables.getLocalVariablesAsync();

    // Filter to get only variables in the 'Primitives' collection using variable IDs
    const primitivesVariables = existingVariables.filter(variable => variableIds.includes(variable.id));

    // Function to extract base name from a variable's full name (e.g., 'color/50' -> 'color')
    const getBaseName = (name: string) => {
      const parts = name.split('/');
      return parts[0]; // Return the base name (before '/')
    };

    // Loop through all color inputs dynamically
    for (const colorKey of Object.keys(colorInputs)) {
      const color = colorInputs[colorKey];
      const palette = generateTintsAndShades(color.hex);

      // Get the base name entered by the user
      const userBaseName = getBaseName(color.name);

      // Check if the base name already exists in the 'Primitives' collection
      const existingBaseVariable = primitivesVariables.find(variable => getBaseName(variable.name) === userBaseName);

      if (existingBaseVariable) {
        // If a variable with the same base name exists, skip and notify the user
        figma.ui.postMessage({
          type: 'error',
          message: `Primitives with the name "${userBaseName}" already exists. Use a different name.`
        });
        figma.notify(`Primitives with the name "${userBaseName}" already exists. Use a different name.`);
        continue; // Skip creating this variable and move to the next color
      }

      // Create new variables for each color in the palette
      await createPaletteVariables(palette, color.name, primitivesCollection);

      // Mark that variables were created
      variablesCreated = true;

      // Send the tints with level names to the UI for display
      figma.ui.postMessage({
        type: 'show-tints',
        tints: palette,
        colorId: colorKey // Pass colorKey to match the correct color input
      });
    }

    // Only show success message if variables were actually created
    if (variablesCreated) {
      figma.ui.postMessage({ type: 'success', message: 'Color palette created successfully.' });
      figma.notify("Variables successfully created!");
    } else {
      figma.ui.postMessage({ type: 'info', message: 'No new variables were created as all base names already exist.' });
    }
  } catch (error) {
    console.error('Error creating color palette:', error);
    figma.ui.postMessage({ type: 'error', message: 'An error occurred while creating the palette.' });
  }
}

// Listen for incoming messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-palette') {
    const colorInputs = msg.colorInputs;
    await createLocalVariables(colorInputs);
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Show the UI
figma.showUI(__html__, { width: 800, height: 500 });
