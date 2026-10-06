import { Redirect } from "expo-router";

/** Invoice scanning lives at the top of the new-asset form. */
export default function ScanScreen() {
  return <Redirect href="/(app)/assets/form?scan=1" />;
}
