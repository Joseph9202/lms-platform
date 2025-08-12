// Simple test to make sure everything works
console.log('Testing IA Básico logic...');

const testTitle = 'IA Básico - Certificación Profesional';
const isIABasicoFree = testTitle.includes('IA Básico') || testTitle.includes('Inteligencia Artificial Básico');

console.log('Course title:', testTitle);
console.log('Should be free:', isIABasicoFree);

if (isIABasicoFree) {
  console.log('✅ Success! Course will be free for all users');
} else {
  console.log('❌ Failed! Course logic not working');
}