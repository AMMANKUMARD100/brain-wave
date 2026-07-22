import AppRoutes from './routes/AppRoutes';
import { QuestionProvider } from './context/QuestionContext';
import { AnswerDashboardProvider } from './context/AnswerDashboardContext';
import { HistoryProvider } from './context/HistoryContext';

function App() {
  return (
    <QuestionProvider>
      <HistoryProvider>
        <AnswerDashboardProvider>
          <AppRoutes />
        </AnswerDashboardProvider>
      </HistoryProvider>
    </QuestionProvider>
  );
}

export default App;
