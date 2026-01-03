export const UPDATE_PAYMENT = `
    mutation UpdatePayment($bookingCode: String!, $paymentStatus: PaymentStatus!){
        updatePaymentStatus(bookingCode: $bookingCode, paymentStatus: $paymentStatus){
            bookingCode
        }
    }
`