import { createContext, useContext, type PropsWithChildren } from 'react';

import { getDatabaseServices, type DatabaseServices } from '@/data/database/client';

const RepositoryContext = createContext<DatabaseServices | null>(null);

export function RepositoryProvider({ children }: PropsWithChildren) {
  return (
    <RepositoryContext.Provider value={getDatabaseServices()}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories(): DatabaseServices {
  const services = useContext(RepositoryContext);
  if (!services) throw new Error('useRepositories must be used within RepositoryProvider');
  return services;
}
