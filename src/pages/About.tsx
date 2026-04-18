import { PageLayout } from "@/components/PageLayout";

const About = () => (
  <PageLayout title="About Us" description="About SmartWeather Pro — fast, free, AI-powered weather for everyone.">
    <section className="container py-12 max-w-3xl prose prose-neutral dark:prose-invert">
      <h1 className="font-display">About SmartWeather Pro</h1>
      <p>
        SmartWeather Pro is a fast, free weather service built for people who want more than just a temperature.
        We combine real-time weather data, air quality, and lifestyle suggestions to help you plan your day.
      </p>
      <h2>What we do</h2>
      <ul>
        <li>Real-time weather and 7-day forecasts for any city worldwide</li>
        <li>Air Quality Index (AQI) with pollutant breakdown</li>
        <li>Smart insights — should you go for a run, carry an umbrella, or stay indoors?</li>
        <li>Mobile-first, fast-loading, and free to use</li>
      </ul>
      <h2>Data sources</h2>
      <p>Weather data is provided by OpenWeatherMap. Maps by OpenStreetMap.</p>
    </section>
  </PageLayout>
);
export default About;
