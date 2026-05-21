/**
 * Convert a local file path to a backend-served image URL
 * @param {string} imagePath - The image path from the database (e.g., "/uploads/..." or file path)
 * @returns {string} - The full image URL accessible via HTTP
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "https://via.placeholder.com/150";
  }

  // If it's already a full URL (http, https), return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a data URL, return as-is
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }

  // Otherwise, assume it's a relative path and prepend the backend URL
  const backendUrl = "http://localhost:8080";
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  return `${backendUrl}${cleanPath}`;
};
