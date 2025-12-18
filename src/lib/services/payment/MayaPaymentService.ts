
import { Firestore, collection, query, where, getDocs } from 'firebase/firestore';
import type { ServiceResponse } from '../../../types/response';

export interface MayaPaymentReceipt {
  id: string;
  bookingId: string;
  amount: string;
  currency: string;
  status: string;
  approvalCode: string;
  receiptNo: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  fundSource?: {
    description: string;
    details?: {
      first6: string;
      last4: string;
      masked: string;
      scheme: string;
      issuer: string;
    };
  };
  isPaid: boolean;
}

export class MayaPaymentService {
  private readonly COLLECTION = 'maya_payments';

  constructor(private db: Firestore) {}

  async getPaymentReceiptByBookingId(bookingId: string): Promise<ServiceResponse> {
    try {
      const paymentsCollection = collection(this.db, this.COLLECTION);
      const q = query(
        paymentsCollection,
        where('bookingId', '==', bookingId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return {
          success: false,
          message: 'No payment record found for this booking'
        };
      }

      const paymentDoc = snapshot.docs[0];
      const paymentData = paymentDoc.data();

      if (paymentData.status !== 'PAYMENT_SUCCESS') {
        return {
          success: false,
          message: `Payment status is ${paymentData.status}, not PAYMENT_SUCCESS`
        };
      }

      const receipt: MayaPaymentReceipt = {
        id: paymentDoc.id,
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        approvalCode: paymentData.approvalCode || paymentData.receipt?.approvalCode,
        receiptNo: paymentData.receipt?.receiptNo,
        transactionId: paymentData.receipt?.transactionId,
        createdAt: paymentData.createdAt,
        updatedAt: paymentData.updatedAt,
        fundSource: paymentData.fundSource,
        isPaid: paymentData.isPaid
      };

      return {
        success: true,
        message: 'Payment receipt retrieved successfully',
        data: receipt
      };
    } catch (error) {
      console.error('Error fetching payment receipt:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch payment receipt'
      };
    }
  }
}

