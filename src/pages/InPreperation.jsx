import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import TaxReturnsList from './TaxReturnsList';

export default function InPreparation() {
  const location = useLocation();
  
  return (
    <div>
      <div className="text-sm text-gray-500 mb-4">
        <Link to="/tax-returns" className="hover:text-blue-600">Tax Returns</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">In Preparation</span>
      </div>
      <TaxReturnsList defaultStatus="In Preparation" />
    </div>
  );
}