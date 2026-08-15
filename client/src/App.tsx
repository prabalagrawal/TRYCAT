import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import PrivacyNotice from "@/pages/PrivacyNotice";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import DataRights from "@/pages/DataRights";
import ConsentBanner from "@/components/ConsentBanner";
import PrivacyPreferences from "@/components/PrivacyPreferences";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import "./compliance.css";

// TRYCAT style reminder: the application shell is deliberately quiet and light so the approved three-cat artwork, ginger signal colour, and rail-based editorial system remain the visual focus.
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/privacy" component={PrivacyNotice} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />
      <Route path="/rights" component={DataRights} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <ConsentBanner />
          <PrivacyPreferences />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
