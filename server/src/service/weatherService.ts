import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  latitude: number;
  longitude: number;
}
// TODO: Define a class for the Weather object
class Weather implements Weather {
  city?: string;
  date: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;
  
  constructor(
    city: string,
    date: string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    iconDescription: string
  ) {
      this.city = city;
      this.date = date;
      this.tempF = tempF;
      this.windSpeed = windSpeed;
      this.humidity = humidity;
      this.icon = icon;
      this.iconDescription = iconDescription;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
   // TODO: Define the baseURL, API key, and city name properties
  private baseURL = process.env.API_BASE_URL || '';
  private apiKey = process.env.API_KEY || ''; 
  public cityName: string = '';
 
  // TODO: Create fetchLocationData method
  // private async fetchLocationData(query: string) {}
  private async fetchLocationData(query: string) {
    try {
    const response = await fetch(query);
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    try{
      const locationData = JSON.parse(responseText);
    return locationData;
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    console.error('Response text:', responseText);
    throw new Error('Unable to parse location data');
  }
} catch (error) {
  console.error('Error in fetchLocationData:', error);
  throw new Error('Unable to retrieve location data');
}
}
    
  // TODO: Create destructureLocationData method
  // private destructureLocationData(locationData: Coordinates): Coordinates {}
  private destructureLocationData(locationData: any): Coordinates {
    locationData = locationData[0];
    const coordinates: Coordinates = {
      latitude: locationData.lat,
      longitude: locationData.lon
    };
    return coordinates;
  }
  // TODO: Create buildGeocodeQuery method
  // private buildGeocodeQuery(): string {}
  private buildGeocodeQuery(cityName: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${cityName}&limit=1&units=imperial&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  // private buildWeatherQuery(coordinates: Coordinates): string {}
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=imperial&appid=${this.apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  // private async fetchAndDestructureLocationData() {}
  private async fetchAndDestructureLocationData(cityName: string) {
    const query = this.buildGeocodeQuery(cityName);
    const locationData = await this.fetchLocationData(query);
    const coordinates = this.destructureLocationData(locationData);
    return coordinates;
  }

  // TODO: Create fetchWeatherData method
  // private async fetchWeatherData(coordinates: Coordinates) {}
  private async fetchWeatherData(coordinates: Coordinates) {
    const query = this.buildWeatherQuery(coordinates);
    const response = await fetch(query);
    const responseText = await response.text();
  
    if (!response.ok) {
      throw new Error('Unable to retrieve weather data');
    }
    try {
      const weatherData = JSON.parse(responseText);
      return weatherData;

    } catch (parseError) {
      console.error('Error parsing weather JSON:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Unable to parse weather data');
    }
  }
  // TODO: Build parseCurrentWeather method
  // private parseCurrentWeather(response: any) {}
  private parseCurrentWeather(response: any): Weather {
    if (!response || !response.list || !response.list[0]) {
      console.error('Invalid weather data:', response);
      throw new Error('Invalid weather data');
    }
  
    const currentWeatherResponse = response.list[0];
  
    const currentWeather = new Weather(
      response.city.name,
      currentWeatherResponse.dt_txt.split(' ')[0],
      currentWeatherResponse.main.temp,
      currentWeatherResponse.wind.speed,
      currentWeatherResponse.main.humidity,
      currentWeatherResponse.weather[0].icon,
      currentWeatherResponse.weather[0].description
    );
    return currentWeather;
  }
  
  // TODO: Complete buildForecastArray method
  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
  private buildForecastArray(weatherData: any): any[] {
    if (!weatherData?.list) {
        console.error('Invalid weather data:', weatherData);
        throw new Error('Invalid weather data');
    }

    const uniqueDays: { [key: string]: boolean } = {};
    const forecastArray: Weather[] = [];

    weatherData.list.forEach((day: any) => {
        const date = day.dt_txt.split(' ')[0]; // Extract the date part
        if (!uniqueDays[date]) {
            uniqueDays[date] = true;
            console.log('Day Data:', day);
            if (!day.main || !day.weather?.[0]) {
                console.error('Invalid day data:', day);
                throw new Error('Invalid day data');
            }

            const { name } = weatherData.city;
            const { temp, humidity } = day.main;
            const { speed } = day.wind;
            const { description, icon } = day.weather[0];

            forecastArray.push(new Weather(name, date, temp, speed, humidity, icon, description));
        }
    });

    return forecastArray;
}
  // TODO: Complete getWeatherForCity method
  // async getWeatherForCity(city: string) {}
  public async getWeatherForCity(cityName: string): Promise<{ currentWeather: Weather, forecastArray: any[] }> {
    try {
      this.cityName = cityName; // Ensure cityName is set
      const coordinates = await this.fetchAndDestructureLocationData(cityName);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecastArray = this.buildForecastArray(weatherData);
      console.log('Current Weather:', currentWeather); // Add logging
      console.log('Forecast Array:', forecastArray); // Add logging
      return { currentWeather, forecastArray };
    } catch (error) {
      console.error('Error in getWeatherForCity:', error);
      throw new Error('Unable to get weather for city');
    }
  }
}
export default new WeatherService();