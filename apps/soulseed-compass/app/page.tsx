"use client";

import { useEffect, useRef, useState } from "react";
import { Screen01Recognition } from "../components/screens/Screen01Recognition";
import { Screen02Offer } from "../components/screens/Screen02Offer";
import { Screen03Question } from "../components/screens/Screen03Question";
import { Screen04Listening } from "../components/screens/Screen04Listening";
import { Screen05Recognition } from "../components/screens/Screen05Recognition";
import { Screen06Proof } from "../components/screens/Screen06Proof";
import { Screen07Snapshot } from "../components/screens/Screen07Snapshot";
import { Screen08Hurl } from "../components/screens/Screen08Hurl";
import { Screen09Completion } from "../components/screens/Screen09Completion";
import { ScreenReturnQuestion } from "../components/screens/ScreenReturnQuestion";
import { Whorl } from "../components/dawn-glass";
import { useSprint10Store } from "../lib/sprint10Store";

// THE canonical route (S89 cutover). A fresh visitor walks the nine Dawn Glass
// screens. A returning visitor — landing via ${APP_URL}/?hurl=<encoded canonical>
// (the byte-identical contract S60's emails carry and S25 honors) — gets the
// 3-screen return flow. Doctrine: "First run proves meetability. Returns deepen
// identity. The first SoulSeed is not the whole tree. It is the viable seed."
export default function HomePage() {
  const currentScreen = useSprint10Store((s) => s.currentScreen);
  const enterByReturnUrl = useSprint10Store((s) => s.enterByReturnUrl);

  // If a ?hurl= is present, hold rendering until resolve/resume settles so the
  // returning user never flashes Screen 1.
  const [booting, setBooting] = useState(true);
  const detected = useRef(false);

  useEffect(() => {
    if (detected.current) return;
    detected.current = true;
    const param = new URLSearchParams(window.location.search).get("hurl");
    if (param) {
      void enterByReturnUrl(param).finally(() => setBooting(false));
    } else {
      setBooting(false);
    }
  }, [enterByReturnUrl]);

  if (booting) {
    return (
      <div className="soulseed-page grid min-h-svh place-items-center">
        <Whorl className="[--whorl-size:160px]" />
      </div>
    );
  }

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
    case "RETURN_QUESTION":
      return <ScreenReturnQuestion />;
    case "RETURN_LISTENING":
      return <Screen04Listening variant="return" />;
    case "RETURN_SNAPSHOT":
      return <Screen07Snapshot showDelta />;
    default:
      return <Screen01Recognition />;
  }
}
