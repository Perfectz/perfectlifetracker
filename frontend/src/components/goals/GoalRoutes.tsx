// frontend/src/components/goals/GoalRoutes.tsx
// Component for handling goal feature routing

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GoalList from './GoalList';
import GoalForm from './GoalForm';
import GoalDetail from './GoalDetail';

const GoalRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<GoalList />} />
      <Route path="/new" element={<GoalForm mode="create" />} />
      <Route path="/edit/:id" element={<GoalForm mode="edit" />} />
      <Route path="/:id" element={<GoalDetail />} />
      <Route path="*" element={<Navigate to="/goals" replace />} />
    </Routes>
  );
};

export default GoalRoutes; 