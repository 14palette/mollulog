import type { SessionStorage } from "react-router";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server/script/deps";
import { type AuthenticateOptions, Strategy } from "remix-auth";

export interface PasskeyStrategyOptions {
  authenticationResponse: AuthenticationResponseJSON;
};

export class PasskeyStrategy<User> extends Strategy<User, PasskeyStrategyOptions> {
  name = "passkey";

  async authenticate(request: Request, sessionStorage: SessionStorage, options: AuthenticateOptions): Promise<User> {
    const authenticationResponse = await request.json<AuthenticationResponseJSON>();
    return this.success(await this.verify({ authenticationResponse }), request, sessionStorage, options);
  }
}
