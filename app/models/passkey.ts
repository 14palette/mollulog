import {
  type AuthenticationResponseJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server/script/deps";
import { nanoid } from "nanoid/non-secure";
import { Env } from "~/env.server";
import { getSenseiById, Sensei } from "./sensei";
import { verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";

export type Passkey = {
  uid: string;
  memo: string;
  createdAt: string;
};

export type DBPasskey = {
  userId: number;
  keyId: string;
  publicKey: string;
  counter: number;
  rawRequest: string;
} & Passkey;

function uint8ArrayToBase64Url(uint8Array: Uint8Array) {
  const base64String = btoa(String.fromCodePoint(...uint8Array));
  return base64String
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function base64UrlToUint8Array(string: string) {
  const base64 = string.replaceAll('-', '+').replaceAll('_', '/');
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.codePointAt(i) ?? 0;
  }
  return bytes;
}

// Meta information for passkeys
export function passkeyRelyingParty(env: Env): { name: string, id: string } {
  return {
    name: "MolluLog | 몰루로그",
    id: env.HOST.replace(/^https?:\/\//, "").split(":")[0],
  };
}

// Passkey registration challenges
function passkeyCreationOptionKey(sensei: Sensei): string {
  return `passkey:creationOptions:${sensei.id}`;
}

export async function createPasskeyCreationOptions(env: Env, sensei: Sensei): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const creationOptions: PublicKeyCredentialCreationOptionsJSON = {
    challenge: nanoid(64),
    rp: passkeyRelyingParty(env),
    user: {
      id: sensei.uid,
      name: sensei.username,
      displayName: sensei.username,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ],
    timeout: 60000,
  };

  await env.KV_SESSION.put(passkeyCreationOptionKey(sensei), JSON.stringify(creationOptions), { expirationTtl: 60000 });

  return creationOptions;
}

// Passkey registration
const CREATE_PASSKEY_QUERY = `
  insert into passkeys (uid, userId, memo, keyId, publicKey, rawRequest, counter)
  values (?1, ?2, ?3, ?4, ?5, ?6, ?7)
`;

export async function verifyAndCreatePasskey(env: Env, sensei: Sensei, response: RegistrationResponseJSON): Promise<Passkey | null> {
  const creationOptionsRaw = await env.KV_SESSION.get(passkeyCreationOptionKey(sensei));
  if (!creationOptionsRaw) {
    return null;
  }

  const creationOptions: PublicKeyCredentialCreationOptionsJSON = JSON.parse(creationOptionsRaw);
  const verificationResult = await verifyRegistrationResponse({
    response,
    expectedChallenge: creationOptions.challenge,
    expectedOrigin: env.HOST,
    expectedRPID: passkeyRelyingParty(env).id,
  });
  if (!verificationResult.verified || !response.response.publicKey || !verificationResult.registrationInfo) {
    return null;
  }

  const { credential } = verificationResult.registrationInfo;
  const passkey: DBPasskey = {
    uid: nanoid(8),
    userId: sensei.id,
    memo: `Passkey #${nanoid(6)}`,
    keyId: credential.id,
    publicKey: uint8ArrayToBase64Url(credential.publicKey),
    rawRequest: JSON.stringify(response),
    counter: 0,
    createdAt: new Date().toISOString(),
  };

  await env.DB.prepare(CREATE_PASSKEY_QUERY).bind(
    passkey.uid, passkey.userId, passkey.memo, passkey.keyId,
    passkey.publicKey, passkey.rawRequest, passkey.counter,
  ).run();
  return { uid: passkey.uid, memo: passkey.memo, createdAt: new Date().toISOString() };
}


// Passkey authentication
function passkeyAuthenticationOptionKey(challenge: string): string {
  return `passkey:authenticationOptions:${challenge}`;
}

export async function createPasskeyAuthenticationOptions(env: Env): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const challenge = nanoid(64);
  const authenticationOptions: PublicKeyCredentialRequestOptionsJSON = {
    challenge,
    rpId: passkeyRelyingParty(env).id,
    userVerification: "preferred",
    timeout: 60000,
  };
  await env.KV_SESSION.put(passkeyAuthenticationOptionKey(challenge), JSON.stringify(authenticationOptions), { expirationTtl: 60000 });

  return authenticationOptions;
};

export async function verifyPasskeyAuthentication(env: Env, response: AuthenticationResponseJSON): Promise<Sensei | null> {
  const passkey = await env.DB.prepare("select * from passkeys where keyId = ?1").bind(response.id).first<DBPasskey>();
  if (!passkey) {
    return null;
  }

  const verificationResult = await verifyAuthenticationResponse({
    response,
    expectedChallenge: async (challenge) => {
      return (await env.KV_SESSION.get(passkeyAuthenticationOptionKey(challenge))) != null;
    },
    expectedOrigin: env.HOST,
    expectedRPID: passkeyRelyingParty(env).id,
    credential: {
      id: passkey.keyId,
      publicKey: base64UrlToUint8Array(passkey.publicKey),
      counter: passkey.counter,
    },
  });
  if (!verificationResult.verified) {
    return null;
  }

  const { newCounter } = verificationResult.authenticationInfo;
  await env.DB.prepare("update passkeys set counter = ?1 where keyId = ?2").bind(newCounter, passkey.keyId).run();

  return getSenseiById(env, passkey.userId);
}


// Get stored passkeys
export async function getPasskeysBySensei(env: Env, sensei: Sensei): Promise<Passkey[]> {
  const passkeys = await env.DB.prepare("select * from passkeys where userId = ?1").bind(sensei.id).all<DBPasskey>();
  return passkeys.results.map((row) => ({ uid: row.uid, memo: row.memo, createdAt: row.createdAt }));
}
