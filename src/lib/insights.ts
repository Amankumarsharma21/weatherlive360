import type { CurrentWeather, ForecastItem, AirData } from "./weather-api";

export interface Insight {
  title: string;
  body: string;
  tone: "positive" | "warning" | "info";
  icon: string;
}

const AQI_LABEL = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];

export function aqiLabel(aqi: 1 | 2 | 3 | 4 | 5) {
  return AQI_LABEL[aqi];
}

export function generateInsights(
  current: CurrentWeather,
  forecast: ForecastItem[],
  air: AirData,
): Insight[] {
  const out: Insight[] = [];
  const temp = current.main.temp;
  const condId = current.weather[0]?.id ?? 800;
  const wind = current.wind.speed;
  const humidity = current.main.humidity;
  const aqi = air.list[0]?.main.aqi ?? 1;

  // Rain in next 12h
  const next12 = forecast.slice(0, 4);
  const rainSoon = next12.some((f) => (f.pop ?? 0) > 0.4 || (f.weather[0]?.id ?? 800) < 600);

  if (rainSoon) {
    out.push({
      title: "Carry an umbrella",
      body: "Rain is likely in the next 12 hours. Plan ahead.",
      tone: "warning",
      icon: "☔",
    });
  }

  if (aqi >= 4) {
    out.push({
      title: "Air quality is poor",
      body: `AQI ${aqiLabel(aqi)} — avoid running and outdoor exercise. Wear a mask if going out.`,
      tone: "warning",
      icon: "😷",
    });
  } else if (aqi <= 2 && temp > 12 && temp < 30 && !rainSoon && condId >= 800) {
    out.push({
      title: "Great time for outdoor activity",
      body: "Clear skies, fresh air, and a comfortable temperature. Get outside!",
      tone: "positive",
      icon: "🏃",
    });
  }

  if (temp >= 35) {
    out.push({
      title: "Heat alert",
      body: "Stay hydrated, avoid midday sun, and take breaks in the shade.",
      tone: "warning",
      icon: "🥵",
    });
  } else if (temp <= 2) {
    out.push({
      title: "Bundle up",
      body: "Freezing temperatures — wear layers and protect exposed skin.",
      tone: "warning",
      icon: "🧥",
    });
  }

  if (wind > 12) {
    out.push({
      title: "Windy conditions",
      body: "Strong winds — secure loose items and be careful when cycling.",
      tone: "warning",
      icon: "💨",
    });
  }

  if (humidity > 85 && temp > 25) {
    out.push({
      title: "Muggy outside",
      body: "High humidity will make it feel hotter. Light, breathable clothing recommended.",
      tone: "info",
      icon: "💧",
    });
  }

  if (condId >= 200 && condId < 300) {
    out.push({
      title: "Thunderstorm warning",
      body: "Avoid open areas and tall trees. Stay indoors if possible.",
      tone: "warning",
      icon: "⛈️",
    });
  }

  if (out.length === 0) {
    out.push({
      title: "Conditions look stable",
      body: "Nothing unusual — enjoy your day!",
      tone: "info",
      icon: "🌤️",
    });
  }

  return out.slice(0, 4);
}

export function aggregateDailyForecast(items: ForecastItem[]) {
  const byDay = new Map<string, ForecastItem[]>();
  for (const it of items) {
    const day = it.dt_txt.split(" ")[0];
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(it);
  }
  return Array.from(byDay.entries())
    .slice(0, 7)
    .map(([day, list]) => {
      const temps = list.map((l) => l.main.temp);
      const min = Math.min(...list.map((l) => l.main.temp_min));
      const max = Math.max(...list.map((l) => l.main.temp_max));
      // pick midday item if available else middle
      const noon = list.find((l) => l.dt_txt.endsWith("12:00:00")) ?? list[Math.floor(list.length / 2)];
      return {
        date: day,
        min, max,
        avg: temps.reduce((a, b) => a + b, 0) / temps.length,
        weather: noon.weather[0],
        pop: Math.max(...list.map((l) => l.pop ?? 0)),
      };
    });
}
