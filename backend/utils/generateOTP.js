/**
 * Generates a random 4-digit OTP code for ride verification.
 * @returns {string} 4-digit numeric string
 */
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = generateOTP;
