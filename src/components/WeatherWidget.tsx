import { useEffect, useState } from 'react';
import './WeatherWidget.css';

type WeatherData = {
  tempC: number;
  tempF: number;
  desc: string;
  icon: string;
};

type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';

const weatherPhrases: Record<string, string[]> = {
  clear: [
    'Beautiful weather we’re having! :)',
    'Sun’s out guns out!  (If only I had arms...)',
    'Crystal clear skies, sweet as Apple Piee',
    'Bright day, bright ideas.',
    'UV rays and FPS frames—both high.',
    'Perfect day to touch grass… or a keyboard.',
  ],
  partly: [
    'Soft clouds, cozy mood.',
    'A few clouds for ambience.',
    'Sky shaders set to “medium clouds.”',
    'Half sunny, half cozy.',
    'Cloud cover: artisanal.',
    'Balanced lighting: nature’s LUT.',
  ],
  cloudy: [
    'Overcast and over it.',
    'Cloud blanket engaged.',
    'Diffuse light—perfect for screens.',
    'Cloudy with a chance of...you know what idk.',
    'Moody skies, moody playlists.',
    'Great day for heads-down focus.',
  ],
  fog: [
    'Fog mode: cinematic.',
    'Low visibility, high aesthetics.',
    'Fog rolling in—drive safe, code safer.',
    'Mist filter set to “dreamy.”',
    'Soft edges everywhere.',
  ],
  drizzle: [
    'Gentle drizzle—grab a light hoodie.',
    'Sprinkles from the sky.',
    'Drizzle soundtrack unlocked.',
    'Tiny drops, big vibes.',
    'Soft rain, soft focus.',
  ],
  rain: [
    'You should grab an umbrella!',
    'ITSRAINING.',
    'Rain rhythm = lo-fi beats.',
    'Wet outside, dry keyboard.',
    'heavy-rain.mp3',
  ],
  snow: [
    'Bundle up, retro friend.',
    'Snowflakes falling like particles.',
    'Cozy season: enabled.',
    'Snow outside, warm code inside.',
    'Frosty world, toasty RAM.',
  ],
  storm: [
    'Stormy skies—stay safe!',
    'Thunder soundtrack incoming.',
    'Lightning-fast builds, please.',
    'Electric vibes outside.',
    'Weather just turned “hard mode.”',
  ],
  unknown: [
    'Weather is being mysterious.',
    'Sky status: computing…',
    'Atmosphere loading…',
    'Weather API is feeling shy.',
    'Cloud service not responding.',
  ],
};

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
            const timeString: string | undefined = data?.current?.time;
            const hour = parseHour(timeString);
            const dayPhase = getDayPhase(hour);
            if (typeof temp === 'number') {
              const tempF = Math.round((temp * 9) / 5 + 32);
              const { icon, bucket } = mapCodeToIcon(code, dayPhase);
              const phraseList = weatherPhrases[bucket] || weatherPhrases.unknown;
              const desc = phraseList[Math.floor(Math.random() * phraseList.length)];
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

  const parseHour = (timeString?: string): number => {
    const parsed = timeString && timeString.length >= 13 ? Number(timeString.slice(11, 13)) : NaN;
    return Number.isFinite(parsed) ? parsed : new Date().getHours();
  };

  const getDayPhase = (hour: number): DayPhase => {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 18) return 'day';
    if (hour >= 18 && hour < 20) return 'dusk';
    return 'night';
  };

  const mapCodeToIcon = (code: number | undefined, dayPhase: DayPhase): { icon: string; bucket: keyof typeof weatherPhrases } => {
    if (code === undefined) return { icon: dayPhase === 'night' ? '🌙' : '🌤️', bucket: 'unknown' };
    if ([0].includes(code)) return { icon: pickSkyIcon('clear', dayPhase), bucket: 'clear' };
    if ([1, 2].includes(code)) return { icon: pickSkyIcon('partly', dayPhase), bucket: 'partly' };
    if ([3].includes(code)) return { icon: pickSkyIcon('cloudy', dayPhase), bucket: 'cloudy' };
    if ([45, 48].includes(code)) return { icon: '🌫️', bucket: 'fog' };
    if ([51, 53, 55, 56, 57].includes(code)) return { icon: dayPhase === 'night' ? '🌧️' : '🌦️', bucket: 'drizzle' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: '🌧️', bucket: 'rain' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: '❄️', bucket: 'snow' };
    if ([95, 96, 99].includes(code)) return { icon: '⛈️', bucket: 'storm' };
    return { icon: dayPhase === 'night' ? '🌙' : '🌤️', bucket: 'unknown' };
  };

  const pickSkyIcon = (bucket: 'clear' | 'partly' | 'cloudy', dayPhase: DayPhase): string => {
    if (dayPhase === 'dawn') return '🌅';
    if (dayPhase === 'dusk') return '🌇';
    if (dayPhase === 'night') return bucket === 'cloudy' ? '☁️' : '🌙';
    if (bucket === 'clear') return '☀️';
    if (bucket === 'partly') return '🌤️';
    return '⛅️';
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
