// frontend/src/components/journals/JournalRouter.ts
// Simplified journal router to avoid chunk loading issues

import JournalDashboard from './JournalDashboard';
import JournalList from './JournalList';
import JournalEditor from './JournalEditor';
import JournalDetail from './JournalDetail';

// Export components directly instead of using lazy loading
export {
  JournalDashboard,
  JournalList,
  JournalEditor,
  JournalDetail
}; 