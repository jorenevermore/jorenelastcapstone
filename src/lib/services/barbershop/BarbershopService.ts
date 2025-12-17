
import type { BarbershopProfile, CreateBarbershopInput, UpdateBarbershopInput } from '../../../types/barbershop';
import type { ServiceResponse } from '../../../types/api';
import { doc, setDoc, getDoc, updateDoc, Firestore } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import { GeoPoint } from 'firebase/firestore';

export class BarbershopService {
  constructor(private db: Firestore) {}

  private handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Barbershop service error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  async createProfile(input: CreateBarbershopInput): Promise<ServiceResponse> {
    try {
      const geohash = geohashForLocation([input.location.lat, input.location.lng]);

      const profile: BarbershopProfile = {
        barbershopId: input.barbershopId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        location: input.location,
        geohash,
        isOpen: false,
        barbers: [],
        services: [],
        createdAt: Date.now(),
        status: 'active'
      };

      await setDoc(doc(this.db, 'barbershops', input.barbershopId), {
        ...profile,
        loc: {
          coordinates: new GeoPoint(input.location.lat, input.location.lng),
          geohash
        }
      });

      return {
        success: true,
        message: 'Barbershop profile created successfully',
        data: profile
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProfile(barbershopId: string): Promise<ServiceResponse> {
    try {
      const docSnap = await getDoc(doc(this.db, 'barbershops', barbershopId));

      if (!docSnap.exists()) {
        return {
          success: false,
          message: 'Barbershop profile not found',
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: docSnap.data()
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(barbershopId: string, input: UpdateBarbershopInput): Promise<ServiceResponse> {
    try {
      const updateData: any = { ...input };

      if (input.location) {
        const geohash = geohashForLocation([input.location.lat, input.location.lng]);
        updateData.loc = {
          coordinates: new GeoPoint(input.location.lat, input.location.lng),
          geohash
        };
        updateData.geohash = geohash;
      }

      await updateDoc(doc(this.db, 'barbershops', barbershopId), updateData);

      return {
        success: true,
        message: 'Barbershop profile updated successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

