import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import JournalPage from './JournalPage';
import JournalDetail from './JournalDetail';
import JournalEditor from './JournalEditor';
import JournalInsights from './JournalInsights';

// Using proper routing for journal components
const JournalRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<JournalPage />} />
      <Route path="/new" element={<JournalEditor mode="create" />} />
      <Route path="/edit/:id" element={<JournalEditor mode="edit" />} />
      <Route path="/insights" element={<JournalInsights />} />
      <Route path="/:id" element={<JournalDetail />} />
      <Route path="*" element={<Navigate to="/journals" replace />} />
    </Routes>
  );
};

export default JournalRoutes; 