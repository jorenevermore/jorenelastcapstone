
import { BaseBarbershopService, BarbershopProfile, Location, ServiceResponse } from './BaseBarbershopService';
import { doc, setDoc, getDoc, updateDoc, Firestore } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import { GeoPoint } from 'firebase/firestore';

export interface CreateBarbershopInput {
  barbershopId: string;
  name: string;
  phone: string;
  email: string;
  location: Location;
}

export interface UpdateBarbershopInput {
  name?: string;
  phone?: string;
  location?: Location;
  isOpen?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
}

export class BarbershopService extends BaseBarbershopService {
  constructor(private db: Firestore) {
    super();
  }

  async createProfile(input: CreateBarbershopInput): Promise<ServiceResponse> {
    try {
      // Validate all inputs
      const nameValidation = this.validateBarbershopName(input.name);
      if (!nameValidation.success) return nameValidation;

      const phoneValidation = this.validatePhone(input.phone);
      if (!phoneValidation.success) return phoneValidation;

      const locationValidation = this.validateLocation(input.location);
      if (!locationValidation.success) return locationValidation;

      // Generate geohash
      const geohash = geohashForLocation([input.location.lat, input.location.lng]);

      // Create barbershop profile
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

      this.logOperation('Create Barbershop Profile', input.barbershopId, true);

      return {
        success: true,
        message: 'Barbershop profile created successfully',
        data: profile
      };
    } catch (error) {
      this.logOperation('Create Barbershop Profile', input.barbershopId, false);
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
      // Validate inputs if provided
      if (input.name) {
        const nameValidation = this.validateBarbershopName(input.name);
        if (!nameValidation.success) return nameValidation;
      }

      if (input.phone) {
        const phoneValidation = this.validatePhone(input.phone);
        if (!phoneValidation.success) return phoneValidation;
      }

      if (input.location) {
        const locationValidation = this.validateLocation(input.location);
        if (!locationValidation.success) return locationValidation;
      }

      let updateData: any = { ...input };

      // If location is updated, regenerate geohash
      if (input.location) {
        const geohash = geohashForLocation([input.location.lat, input.location.lng]);
        updateData.loc = {
          coordinates: new GeoPoint(input.location.lat, input.location.lng),
          geohash
        };
        updateData.geohash = geohash;
      }

      await updateDoc(doc(this.db, 'barbershops', barbershopId), updateData);

      this.logOperation('Update Barbershop Profile', barbershopId, true);

      return {
        success: true,
        message: 'Barbershop profile updated successfully'
      };
    } catch (error) {
      this.logOperation('Update Barbershop Profile', barbershopId, false);
      return this.handleError(error);
    }
  }
}

