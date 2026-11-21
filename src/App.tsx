import {
  ErrorBoundary,
  lazy,
  LocationProvider,
  Route,
  Router,
} from "preact-iso";

const Home = lazy(() => import("#view/index.tsx"));
const About = lazy(() => import("#view/About/index.tsx"));

const App = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
};

export default App;
