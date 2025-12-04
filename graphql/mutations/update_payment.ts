import gql from "graphql-tag";

export const UPDATE_PAYMENT = gql`
    mutation UpdatePayment($bookingCode: String!, $paymentStatus: PaymentStatus!){
        updatePaymentStatus(bookingCode: $bookingCode, paymentStatus: $paymentStatus){
            bookingCode
        }
    }
`