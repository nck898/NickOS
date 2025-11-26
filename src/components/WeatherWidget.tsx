import { useEffect, useState } from 'react';
import './WeatherWidget.css';

type WeatherData = {
  tempC: number;
  tempF: number;
  desc: string;
  icon: string;
};

const phrases = [
  'Beautiful sunny weather we’re having!',
  'You should grab an umbrella!',
  'Pixel-perfect skies.',
  'Bundle up, retro friend.',
  'Great day to code and chill.',
];

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<string>('Locating…');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('Location not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('Fetching weather…');
        const { latitude, longitude } = pos.coords;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`)
          .then((res) => res.json())
          .then((data) => {
            const temp = data?.current?.temperature_2m;
            const code = data?.current?.weather_code;
            const desc = phrases[Math.floor(Math.random() * phrases.length)];
            if (typeof temp === 'number') {
              const tempF = Math.round((temp * 9) / 5 + 32);
              const icon = mapCodeToIcon(code);
              setWeather({ tempC: temp, tempF, desc, icon });
              setStatus('');
            } else {
              setStatus('Weather unavailable');
            }
          })
          .catch(() => setStatus('Weather unavailable'));
      },
      () => setStatus('Location denied')
    );
  }, []);

  const mapCodeToIcon = (code: number | undefined): string => {
    if (code === undefined) return '🌤️';
    if ([0].includes(code)) return '☀️';
    if ([1, 2].includes(code)) return '🌤️';
    if ([3].includes(code)) return '⛅️';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌤️';
  };

  return (
    <div className="weather-widget">
      {weather ? (
        <>
          <div className="weather-line">
            <span className="weather-emoji">{weather.icon}</span>
            <span className="weather-temp">{weather.tempF}°F</span>
          </div>
          <div className="weather-desc">{weather.desc}</div>
        </>
      ) : (
        <div className="weather-status">{status}</div>
      )}
    </div>
  );
};

export default WeatherWidget;
