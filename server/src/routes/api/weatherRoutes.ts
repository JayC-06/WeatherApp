import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  
  // TODO: GET weather data from city name
  try {
    const cityName = req.body.cityName;
    const data = await WeatherService.getWeatherForCity(cityName);
    if (!data || !data.currentWeather || !data.forecastArray) {
      throw new Error('Invalid weather data received');
    }

    const weatherInfo = [data.currentWeather, ...data.forecastArray];
    await HistoryService.addCity(cityName);
    return res.json(weatherInfo);
    
  } catch (error) {
    return res.json('Failed to fetch weather data');
  }
});


// TODO: GET search history
router.get('/history', async (_req, res) => {
try {
  const history = await HistoryService.getCities();
  return res.status(200).json(history);
}catch(error){
  return res.status(500).json({ error: 'Failed to retrieve search history' });
}
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (_req, res) => {
  const id = _req.params.id;
  await HistoryService.removeCity(id);
  res.status(204).send();
});

export default router;