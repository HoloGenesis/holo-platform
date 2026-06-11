"use client";

import { Screen01Recognition } from "../../components/screens/Screen01Recognition";
import { Screen02Offer } from "../../components/screens/Screen02Offer";
import { Screen03Question } from "../../components/screens/Screen03Question";
import { Screen04Listening } from "../../components/screens/Screen04Listening";
import { Screen05Recognition } from "../../components/screens/Screen05Recognition";
import { Screen06Proof } from "../../components/screens/Screen06Proof";
import { Screen07Snapshot } from "../../components/screens/Screen07Snapshot";
import { Screen08Hurl } from "../../components/screens/Screen08Hurl";
import { Screen09Completion } from "../../components/screens/Screen09Completion";
import { useSprint10Store } from "../../lib/sprint10Store";

// Parallel route for the Sprint-10 nine-screen rebuild. Lives at /sprint10 so
// the original / experience keeps working until the S89 cutover. All nine
// screens are live as of S88.
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
    case 7:
      return <Screen07Snapshot />;
    case 8:
      return <Screen08Hurl />;
    case 9:
      return <Screen09Completion />;
    default:
      return <Screen01Recognition />;
  }
}
