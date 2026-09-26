// Configuração do Firebase (login com Google + dados na nuvem).
//
// Esses dados NÃO são senha: é normal eles ficarem dentro do app.
// Quem protege os dados de cada pessoa são as Regras do Firestore
// (cada conta só lê e grava a própria pasta "usuarios/<id da conta>").
//
// Para usar outro projeto: console.firebase.google.com -> Configurações do projeto
// -> Seus apps -> copie o "firebaseConfig" e cole no lugar do objeto abaixo.
const CONFIG_DO_PROJETO = {
  apiKey: "AIzaSyA703KoFgRLfVxiToF9LczgZwE8Fxw-vpk",
  authDomain: "meu-financeiro-4c51a.firebaseapp.com",
  projectId: "meu-financeiro-4c51a",
  storageBucket: "meu-financeiro-4c51a.firebasestorage.app",
  messagingSenderId: "566368681758",
  appId: "1:566368681758:web:257dda4b5202fc331a930f"
};

// Só nos testes: aponta para os emuladores do Firebase (ex.: VITE_NUVEM_EMULADOR=127.0.0.1)
const EMULADOR = import.meta.env.VITE_NUVEM_EMULADOR || "";

export const NUVEM_EMULADOR = EMULADOR;

export const FIREBASE_CONFIG = EMULADOR
  ? {
      apiKey: "chave-de-teste",
      authDomain: "demo-meu-financeiro.firebaseapp.com",
      projectId: "demo-meu-financeiro",
      appId: "1:000000000000:web:teste"
    }
  : CONFIG_DO_PROJETO;

export const NUVEM_CONFIGURADA = Boolean(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
