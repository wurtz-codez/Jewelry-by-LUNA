const SibApiV3Sdk = require('@getbrevo/brevo');
const crypto = require('crypto');

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email using Brevo
const sendOTPEmail = async (email, otp) => {
    const sender = {
        email: process.env.EMAIL_FROM || 'your-verified-sender@yourdomain.com',
        name: 'Jewelry by LUNA'
    };

    const receivers = [{
        email: email
    }];

    const emailContent = {
        sender,
        to: receivers,
        subject: 'Your OTP for Jewelry by LUNA',
        htmlContent: `
            <h1>Email Verification</h1>
            <p>Your OTP for verification is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
        `
    };

    try {
        const data = await apiInstance.sendTransacEmail(emailContent);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error };
    }
};

// Store OTP with expiration
const storeOTP = (email, otp) => {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email, { otp, expiresAt });
};

// Verify OTP
const verifyOTP = (email, otp) => {
    const storedData = otpStore.get(email);
    
    if (!storedData) {
        return { valid: false, message: 'OTP not found' };
    }

    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return { valid: false, message: 'OTP expired' };
    }

    if (storedData.otp !== otp) {
        return { valid: false, message: 'Invalid OTP' };
    }

    otpStore.delete(email);
    return { valid: true, message: 'OTP verified successfully' };
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    storeOTP,
    verifyOTP
}; 