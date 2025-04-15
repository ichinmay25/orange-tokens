// colorUtils.ts

// Function to convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }
  
  // Function to convert hex to RGB
  export function hexToRgb(hex: string): RGB {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  }
  
  // Function to generate tints and shades based on a given color
  export function generateTintsAndShades(hex: string): string[] {
    const baseColor = parseInt(hex.slice(1), 16);
    const r = (baseColor >> 16) & 0xFF;
    const g = (baseColor >> 8) & 0xFF;
    const b = baseColor & 0xFF;
  
    const tintsAndShades: string[] = [];
  
    const lightnessLevels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  
    lightnessLevels.forEach((level) => {
      let factor: number;
  
      if (level < 500) {
        factor = (500 - level) / 500;
      } else if (level > 500) {
        factor = (level - 500) / 500;
      } else {
        factor = 0;
      }
  
      const newR = level < 500 ? Math.round(r + (255 - r) * factor) : Math.round(r - (r * factor));
      const newG = level < 500 ? Math.round(g + (255 - g) * factor) : Math.round(g - (g * factor));
      const newB = level < 500 ? Math.round(b + (255 - b) * factor) : Math.round(b - (b * factor));
  
      tintsAndShades.push(rgbToHex(newR, newG, newB));
    });
  
    return tintsAndShades;
  }
  