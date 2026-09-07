import RegisterDevcon from "@/features/register/devcon/Register";
import RegisterEthIndia from "@/features/register/ethindia/Register";
import { logClientEvent } from "@/lib/frontend/metrics";
import { storage } from "@/lib/storage";
import { TapInfo } from "@/lib/storage/types";
import { ChipIssuer } from "@types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import RegisterChipless from "@/features/register/chipless/Register";

const Register: React.FC = () => {
  const router = useRouter();
  const [attemptedToLoadSavedTap, setAttemptedToLoadSavedTap] = useState(false);
  const [savedTap, setSavedTap] = useState<TapInfo | null>(null);

  useEffect(() => {
    const loadSavedTap = async () => {
      const tap = await storage.loadSavedTapInfo();
      if (tap) {
        await storage.deleteSavedTapInfo();

        if (tap.tapResponse.chipIsRegistered) {
          logClientEvent("register-chip-already-registered", {});
          toast.error("Chip is already registered!");
          router.push("/");
          return;
        }

        if (tap.tapResponse.chipIssuer === ChipIssuer.EDGE_CITY_LANNA) {
          toast.error("Edge City Lanna registration has ended.");
          router.push("/");
          return;
        }

        setSavedTap(tap);
      }
      setAttemptedToLoadSavedTap(true);
    };
    loadSavedTap();
  }, [router]);

  if (!attemptedToLoadSavedTap) {
    return null;
  }

  if (savedTap?.tapResponse.chipIssuer === ChipIssuer.DEVCON_2024) {
    return <RegisterDevcon savedTap={savedTap} />;
  }

  if (savedTap?.tapResponse.chipIssuer === ChipIssuer.ETH_INDIA_2024) {
    return <RegisterEthIndia savedTap={savedTap} />;
  } else {
    return <RegisterChipless />;
  }
};

export default Register;
