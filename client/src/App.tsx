import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Participants from "./pages/Participants";
import Expenses from "./pages/Expenses";
import Settlement from "./pages/Settlement";
import Treasurer from "./pages/Treasurer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/participants" component={Participants} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/settlement" component={Settlement} />
      <Route path="/treasurer" component={Treasurer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
