import React, {createContext, useContext} from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';

const SubscriptionsContext = createContext<ReturnType<typeof useSubscriptions> | null>(null);

export function SubscriptionsProvider({children} : {children: React.ReactNode}){
    const subscriptionsState = useSubscriptions(); // una sola instancia global
    return (
        <SubscriptionsContext.Provider value={subscriptionsState}>
            {children}
        </SubscriptionsContext.Provider>
    );
}

export function useSubscriptionsContext(){
    const ctx = useContext(SubscriptionsContext);
    if (!ctx) throw new Error('useSubscriptionsCOntext debe usarse dentro de SubscriptionsProvider');

    return ctx;
}