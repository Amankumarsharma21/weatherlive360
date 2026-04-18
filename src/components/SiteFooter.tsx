import { Link } from "react-router-dom";
import { Cloud } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/40 bg-secondary/30">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-sky text-primary-foreground">
              <Cloud className="h-5 w-5" />
            </span>
            SmartWeather <span className="text-primary">Pro</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Real-time weather, air quality, and smart lifestyle suggestions for cities worldwide.
          </p>
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm mb-3">Explore</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
            <li><Link to="/favorites" className="hover:text-foreground">Favorites</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm mb-3">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm mb-3">Legal</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="container py-4 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} SmartWeather Pro. All rights reserved.</span>
          <span>Weather data by OpenWeatherMap.</span>
        </div>
      </div>
    </footer>
  );
}
