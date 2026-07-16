/**
 * Script de test OTP - Debug l'envoi d'OTP
 * Usage: node test-otp.js <phone> [otp]
 */

require('dotenv').config();
const otpService = require('./src/services/otpService');

const phone = process.argv[2] || '+221771234567';
const testOtp = process.argv[3] || '123456';

console.log('🧪 Test OTP Service');
console.log('==================');
console.log('Provider:', process.env.OTP_PROVIDER || 'nexteranga');
console.log('Phone:', phone);
console.log('OTP Test:', testOtp);
console.log('');

(async () => {
  try {
    console.log('📤 Envoi OTP...');
    const result = await otpService.sendOTP(phone, testOtp);
    
    console.log('✅ Résultat:', result);
    
    if (result) {
      console.log('✨ OTP envoyé avec succès!');
      console.log('\n📝 Pour tester en dev: DEV_OTP_REDIRECT_TO dans .env');
    } else {
      console.log('❌ Échec envoi OTP');
      console.log('\n💡 Solutions:');
      console.log('1. Vérifier que NEXTERANGA_SECRET est configuré');
      console.log('2. Vérifier que le service Nexteranga est accessible');
      console.log('3. Vérifier le format du numéro (+221771234567)');
      console.log('4. Utiliser DEV_OTP_REDIRECT_TO pour rediriger vers un numéro de test');
    }
    
    process.exit(result ? 0 : 1);
  } catch (error) {
    console.error('❌ Erreur test:', error.message);
    process.exit(1);
  }
})();
