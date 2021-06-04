// trackingId = Id in our system for the merchant
export function getPartnerReferralBody(returnUrl, trackingId) {
    return {
        tracking_id: trackingId,
        operations: [
            {
                operation: 'API_INTEGRATION',
                api_integration_preference: {
                    rest_api_integration: {
                        integration_method: 'PAYPAL',
                        integration_type: 'THIRD_PARTY',
                        third_party_details: {
                            features: ['PAYMENT', 'REFUND'],
                        },
                    },
                },
            },
        ],
        products: ['EXPRESS_CHECKOUT'],
        legal_consents: [
            {
                type: 'SHARE_DATA_CONSENT',
                granted: true,
            },
        ],
        partner_config_override: {
            return_url: returnUrl,
        },
    };
}
