import {
  ErrorBoundary,
  lazy,
  LocationProvider,
  Route,
  Router,
} from "preact-iso";
// import "#/App.css";

const Home = lazy(() => import("#view/index.tsx"));
const Ledger = lazy(() => import("#view/Ledger/index.tsx"));
const Habit = lazy(() => import("#view/Habit/index.tsx"));
const Health = lazy(() => import("#view/Health/index.tsx"));

const App = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/ledger" component={Ledger} />
          <Route path="/habit" component={Habit} />
          <Route path="/health" component={Health} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
};

export default App;
