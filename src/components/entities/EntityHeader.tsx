import React from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { EntityRelationsList } from './EntityRelationsList';

interface EntityHeaderProps {
  entity: Pick<EntityDetailsData, 'name' | 'cui' | 'address' | 'uat' | 'children' | 'parents'>;
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({ entity }) => {
  return (
    <header className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow mb-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{entity.name}</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400">CUI: {entity.cui}</p>
      {entity.address && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Address: {entity.address}</p>
      )}
      {entity.uat && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          UAT: {entity.uat.name} (County: {entity.uat.county_name || 'N/A'})
        </p>
      )}
      
      <EntityRelationsList
        entities={entity.children}
        title="Entitati finantate"
        maxVisibleItems={3}
        maxHeight="200px"
        showSearchThreshold={10}
      />
      
      <EntityRelationsList
        entities={entity.parents}
        title="Finantatori"
        maxVisibleItems={3}
        maxHeight="200px"
        showSearchThreshold={10}
      />
    </header>
  );
}; 