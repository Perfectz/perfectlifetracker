// frontend/src/components/activities/ActivityRoutes.tsx
// Routes for activities feature

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ActivitiesPage from './ActivitiesPage';
import NewActivityPage from './NewActivityPage';
import EditActivityPage from './EditActivityPage';

const ActivityRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ActivitiesPage />} />
      <Route path="/new" element={<NewActivityPage />} />
      <Route path="/edit/:id" element={<EditActivityPage />} />
      <Route path="*" element={<Navigate to="/activities" replace />} />
    </Routes>
  );
};

export default ActivityRoutes; 