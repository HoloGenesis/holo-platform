"use client";

import { Screen01Recognition } from "../../components/screens/Screen01Recognition";
import { useSprint10Store } from "../../lib/sprint10Store";

// Parallel route for the Sprint-10 nine-screen rebuild. Lives at /sprint10 so
// the original / experience keeps working until the S89 cutover. Screens 2–9
// are filled in by S83+; for now they show a placeholder.
export default function Sprint10Page() {
  const currentScreen = useSprint10Store((s) => s.currentScreen);

  if (currentScreen === 1) return <Screen01Recognition />;

  return (
    <div className="soulseed-page grid min-h-svh place-items-center px-6 text-center text-soulseed-dawn">
      <p className="ss-ui text-lg text-soulseed-dawn/70">
        Screen {currentScreen} of 9 — coming in a later section.
      </p>
    </div>
  );
}
