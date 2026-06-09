"use client";

import { Screen01Recognition } from "../../components/screens/Screen01Recognition";
import { Screen02Offer } from "../../components/screens/Screen02Offer";
import { Screen03Question } from "../../components/screens/Screen03Question";
import { Screen04Listening } from "../../components/screens/Screen04Listening";
import { Screen05Recognition } from "../../components/screens/Screen05Recognition";
import { Screen06Proof } from "../../components/screens/Screen06Proof";
import { useSprint10Store } from "../../lib/sprint10Store";

// Parallel route for the Sprint-10 nine-screen rebuild. Lives at /sprint10 so
// the original / experience keeps working until the S89 cutover. Screens 6–9
// are filled in by S85+; for now they show a placeholder.
export default function Sprint10Page() {
  const currentScreen = useSprint10Store((s) => s.currentScreen);

  switch (currentScreen) {
    case 1:
      return <Screen01Recognition />;
    case 2:
      return <Screen02Offer />;
    case 3:
      return <Screen03Question />;
    case 4:
      return <Screen04Listening />;
    case 5:
      return <Screen05Recognition />;
    case 6:
      return <Screen06Proof />;
    default:
      return (
        <div className="soulseed-page grid min-h-svh place-items-center px-6 text-center text-soulseed-dawn">
          <p className="ss-ui text-lg text-soulseed-dawn/70">
            Screen {currentScreen} of 9 — coming in a later section.
          </p>
        </div>
      );
  }
}
