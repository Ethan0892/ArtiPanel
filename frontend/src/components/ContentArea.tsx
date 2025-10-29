/**
 * Main Content Area Component
 * 
 * Displays dashboard and page content based on route
 */

import React from 'react';
import Router from './Router';

interface ContentAreaProps {
  currentPage: string;
}

const ContentArea: React.FC<ContentAreaProps> = ({ currentPage }) => {
  return <Router currentPage={currentPage} />;
};

export default ContentArea;
