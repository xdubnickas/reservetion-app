/**
 * Generates initial letters from a string (typically used for placeholder images)
 * @param {string} name - The name to extract initials from
 * @returns {string} The initials (maximum 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

/**
 * Generates a background color based on string content (for consistent coloring)
 * @param {string} str - String to generate color from
 * @returns {string} A hex color code
 */
export const stringToColor = (str) => {
  if (!str) return '#0c6bb1'; // Default color
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate colors in blue/purple spectrum for better UI consistency
  const h = Math.abs(hash) % 60 + 200; // Hue between 200-260 (blues/purples)
  const s = Math.abs(hash) % 30 + 50;  // Saturation between 50-80%
  const l = Math.abs(hash) % 20 + 40;  // Lightness between 40-60%
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

/**
 * Checks if an image URL is valid or if we need a placeholder
 * @param {string} imagePath - The image path to check
 * @returns {boolean} True if the image path seems valid
 */
export const hasValidImage = (imagePath) => {
  return imagePath && !imagePath.includes('null') && !imagePath.includes('undefined');
};
