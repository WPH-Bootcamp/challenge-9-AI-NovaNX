export type PaymentSuccessState = {
  dateIso: string;
  paymentMethodLabel: string;
  itemCount: number;
  price: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
};
