import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef } from "react";
import { googleClientIds, isGoogleSignInConfigured } from "../../lib/config";
import { Button } from "../ui/Button";

WebBrowser.maybeCompleteAuthSession();

type Props = {
  disabled?: boolean;
  onIdToken: (idToken: string) => void;
  onError: (message: string) => void;
};

/**
 * The Google auth hook throws when the current platform has no client ID, so
 * it lives in its own component that only renders once one is configured.
 */
export function GoogleSignInButton(props: Props) {
  if (!isGoogleSignInConfigured) return null;
  return <ConfiguredGoogleButton {...props} />;
}

function ConfiguredGoogleButton({ disabled, onIdToken, onError }: Props) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: googleClientIds.android,
    iosClientId: googleClientIds.ios,
    webClientId: googleClientIds.web,
  });
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (response?.type === "error") onError("Google sign-in could not be completed.");
    if (response?.type !== "success") return;
    const idToken = response.params.id_token ?? response.authentication?.idToken;
    if (!idToken) {
      onError("Google did not return a sign-in token.");
      return;
    }
    if (handled.current === idToken) return;
    handled.current = idToken;
    onIdToken(idToken);
  }, [onError, onIdToken, response]);

  return (
    <Button
      title="Continue with Google"
      variant="outline"
      fullWidth
      disabled={!request || disabled}
      onPress={() => void promptAsync()}
    />
  );
}
