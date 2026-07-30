import { AppProviders } from '@workspace/frontend-core';
import { AppRouter } from './routes';

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
