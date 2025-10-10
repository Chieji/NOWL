import CryptoJS from 'crypto-js';

// Generate a key from the extension ID for consistent encryption
const getEncryptionKey = (): string => {
  const extensionId = chrome.runtime.id || 'face-extension-default-key';
  return CryptoJS.SHA256(extensionId).toString();
};

export const encryptData = (data: string): string => {
  const key = getEncryptionKey();
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decryptData = (encryptedData: string): string => {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

export const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 8) return '••••••••';
  return '••••••••' + apiKey.slice(-4);
};