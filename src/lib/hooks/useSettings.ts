'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { BarbershopProfile } from '../../types/barbershop';

export function useSettings() {
  const [user] = useAuthState(auth);
  const [barbershopData, setBarbershopData] = useState<BarbershopProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const docRef = doc(db, 'barbershops', user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setBarbershopData(snapshot.data() as BarbershopProfile);
        }
      } catch (err) {
        console.error('Error loading barbershop:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return { barbershopData, loading };
}

