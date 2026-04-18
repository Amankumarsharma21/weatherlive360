import { PageLayout } from "@/components/PageLayout";

const Terms = () => (
  <PageLayout title="Terms & Conditions" description="Terms governing your use of SmartWeather Pro.">
    <section className="container py-12 max-w-3xl prose prose-neutral dark:prose-invert">
      <h1 className="font-display">Terms &amp; Conditions</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>Acceptance</h2>
      <p>By using SmartWeather Pro you agree to these terms.</p>

      <h2>Use of the service</h2>
      <p>SmartWeather Pro provides weather information for general informational purposes. Do not rely on it for safety-critical decisions (aviation, emergency response, etc.). Always consult an official meteorological agency for those.</p>

      <h2>No warranty</h2>
      <p>The service is provided "as is" without warranties of any kind. Weather data is sourced from third parties and may be inaccurate or delayed.</p>

      <h2>Liability</h2>
      <p>To the fullest extent permitted by law, SmartWeather Pro is not liable for any damages arising from your use of the service.</p>

      <h2>Changes</h2>
      <p>We may update these terms. Continued use of the service constitutes acceptance.</p>
    </section>
  </PageLayout>
);
export default Terms;
