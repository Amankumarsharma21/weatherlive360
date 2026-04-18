import { PageLayout } from "@/components/PageLayout";

const Privacy = () => (
  <PageLayout title="Privacy Policy" description="How SmartWeather Pro collects, uses and protects your data.">
    <section className="container py-12 max-w-3xl prose prose-neutral dark:prose-invert">
      <h1 className="font-display">Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>SmartWeather Pro ("we", "us") respects your privacy. This page explains what we collect and why.</p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Location data</strong> — only when you explicitly grant permission via your browser. It is used to fetch weather for your area and is never stored on our servers.</li>
        <li><strong>Favorites</strong> — saved locally in your browser (localStorage). We do not sync them.</li>
        <li><strong>Usage analytics</strong> — anonymous page views and interactions to improve the product.</li>
      </ul>

      <h2>Cookies & advertising</h2>
      <p>We may display ads via Google AdSense. AdSense uses cookies to serve ads based on your prior visits. You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>.</p>

      <h2>Third-party services</h2>
      <ul>
        <li>OpenWeatherMap — weather data</li>
        <li>OpenStreetMap — maps</li>
        <li>Google AdSense — advertising</li>
      </ul>

      <h2>Your rights</h2>
      <p>You can clear locally stored favorites at any time by clearing your browser data.</p>

      <h2>Contact</h2>
      <p>Questions? See our <a href="/contact">contact page</a>.</p>
    </section>
  </PageLayout>
);
export default Privacy;
