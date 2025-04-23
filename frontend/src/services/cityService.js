const API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';
const apiKey = import.meta.env.VITE_GEODB_API_KEY;
const apiHost = import.meta.env.VITE_GEODB_API_HOST;

export const cityService = {
  searchCities: async (namePrefix, limit = 10) => {
    try {
      const response = await fetch(`${API_URL}/cities?namePrefix=${encodeURIComponent(namePrefix)}&regionCodes=EU&types=CITY&sort=name&limit=${limit}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the data to include only what we need
      if (data && data.data) {
        // Clean up the results to ensure there are no malformed entries
        const cleanedData = data.data.filter(city => 
          city.name && city.countryCode && !city.name.includes(' - ') && !city.name.includes(' / ')
        );
        return { data: cleanedData };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return { data: [] };
    }
  },

  // Parse city string to extract name and country code
  parseCity: (cityString) => {
    if (!cityString) return { name: '', countryCode: '' };
    
    const parts = cityString.split(',').map(part => part.trim());
    if (parts.length === 2) {
      return { name: parts[0], countryCode: parts[1] };
    }
    
    return { name: parts[0], countryCode: '' };
  }
};
