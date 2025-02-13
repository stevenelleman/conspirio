import { PrismaClient } from "@prisma/client";
import { generateSignatureKeyPair } from "../../lib/util";
import { v4 as uuidv4 } from "uuid";
// import { EDGE_CITY_LANNA_LOCATION_CHIPS } from "./locationChips";

const prisma = new PrismaClient();

export interface LocationChip {
  uid: string;
  name: string;
  description: string;
}

async function loadLocationChips() {
  try {
    console.log("Starting to load location chips...");
    // const chipSource: LocationChip[] = EDGE_CITY_LANNA_LOCATION_CHIPS;
    const chipSource: LocationChip[] = [];
    const chipsToCreate = chipSource
      .map(({ uid, name, description }) => {
        const { signingKey, verifyingKey } = generateSignatureKeyPair();
        return {
          chipId: uid,
          chipIssuer: "EDGE_CITY_LANNA",
          chipVariant: "NTAG212",
          chipIsRegistered: true,
          chipRegisteredAt: new Date(),
          chipPublicKey: verifyingKey,
          chipPrivateKey: signingKey,
          chipTapCount: 0,
          isLocationChip: true,
          locationId: uuidv4(),
          locationName: name,
          locationDescription: description,
        };
      })
      .filter((chip) => chip !== null);

    try {
      const res = await prisma.chip.createMany({
        data: chipsToCreate,
        skipDuplicates: true,
      });
      console.log("Chips created:", res);
    } catch (error) {
      console.error("Error creating chips:", error);
    }

    console.log("Finished loading location chips.");
  } catch (error) {
    console.error("Error loading location chips:", error);
  } finally {
    await prisma.$disconnect();
  }
}

loadLocationChips();
