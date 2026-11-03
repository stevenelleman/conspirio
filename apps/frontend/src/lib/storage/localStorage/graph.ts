import { storage } from "@/lib/storage";
import {
  createEdgeBackfillForEnabledUserBackup,
  createToggleSocialGraphBackup,
  createUserDataBackup
} from "@/lib/backup";
import { saveBackupAndUpdateStorage } from "@/lib/storage/localStorage/utils";
import { upsertSocialGraphEdge } from "@/lib/graph";
import { sha256 } from "js-sha256";
import { UserData } from "@/lib/storage/types";
import { errorToString } from "@types";
import { User, Session } from "@/lib/storage/types";

export const updateBackfilledEdgesOnUser = (user: User, updatedEdgeIds: string[]): User => {
  // Update local edges
  if (updatedEdgeIds && updatedEdgeIds.length > 0 && user.edges) {
    // This hurts my soul
    for (const edgeId of updatedEdgeIds) {
      for (let i = 0; i < user.edges.length; i++) {
        if (user.edges[i].edgeId === edgeId) {
          user.edges[i].sentHash = true;
        }
      }
    }
  }
  return user;
}

interface UserEdges {
  userNodeId: string,
  sentEdges: string[],
}


// This backfills without consideration of feature enablement. That consideration is within the context of the call
// site.
const backfillEdges = async (user: User, session: Session): Promise<UserEdges> => {
  const sentEdges: string[] = [];

  // TODO: make helper method for userNodeId
  // User node identifier
  const userNodeId = sha256(
    // sha256(user.signaturePrivateKey).concat(DEVCON) -- use this method if eventually node IDs are not shared
    // between communities
    sha256(user.signaturePrivateKey)

  );

  // The value is updated in the backup method, so it should be currently false and will soon be flipped to true
  if (user.edges) {
    for (let i = 0; i < user.edges.length; i++) {
      const edge = user.edges[i];
      try {
        if (!edge.sentHash) {
          if (edge.isTapSender) {
            await upsertSocialGraphEdge(session.authTokenValue, edge.edgeId, userNodeId, null);
          } else {
            await upsertSocialGraphEdge(session.authTokenValue, edge.edgeId, null, userNodeId);
          }
          // Is it valid to directly modify the edge or should there be another backup type?
          user.edges[i].sentHash = true;
          // Include in backup:
          sentEdges.push(edge.edgeId);
        }
      } catch (error) {
        console.log(`Upsert edge failed, continue: ${errorToString(error)}`)
      }
    }
  }

  return { userNodeId, sentEdges };
}

// For users that enabled the graph feature *before* the backfill there will be nothing that triggers a backfill. In
// this case we run *1 backfill* automatically
export const backfillEdgesForUserWithFeatureAlreadyEnabled = async (user: User, session: Session): Promise<void> => {
  if (user && user.userData?.settings?.tapGraphEnabled && !user.edgesBackfilledForUsersWithEnabledFeature) {
    const userEdges: UserEdges = await backfillEdges(user, session);

    // Does the user node ID need to updated?

    const backup = createEdgeBackfillForEnabledUserBackup({
      email: user.email,
      password: session.backupMasterPassword,
      sentEdges: userEdges.sentEdges, // Will always be some kind of array now
    });

    await saveBackupAndUpdateStorage({
      user,
      session,
      newBackupData: [backup]
    });
  }

  return;
}

// By the end of the method:
// - edges are created and backed up
// - userData.settings.tapGraphEnabled set to true / false
// - userData.graphNodeId set to provided value
const backfillEdgesForTogglingGraphFeature = async (user: User, session: Session): Promise<void> => {
  let userNodeId: string | undefined = undefined;
  let sentEdges: string[] = [];

  // Only backfill if feature is flipped from "false" -> "true"
  if (user && user.edges && !user.userData?.settings?.tapGraphEnabled) {
    // Damn, I feel like all this code needs to be audited, rewritten
    const userEdges: UserEdges = await backfillEdges(user, session);
    userNodeId = userEdges.userNodeId;
    sentEdges = userEdges.sentEdges;
  }

  console.log("SentEdges", sentEdges)

  // Add edges, and if graph disabled, replace edges with empty array
  const backup = createToggleSocialGraphBackup({
    email: user.email,
    password: session.backupMasterPassword,
    sentEdges, // Will always be some kind of array now
  });

  await saveBackupAndUpdateStorage({
    user,
    session,
    newBackupData: [backup]
  });

  // Modify userData values: settings, userNodeId
  const updatedUserData: UserData = user.userData;

  if (!updatedUserData.settings) {
    user.userData.settings = {
      tapGraphEnabled: true,
      automaticPSIEnabled: true,
    }
  } else if (updatedUserData.settings.tapGraphEnabled === undefined) {
    updatedUserData.settings.tapGraphEnabled = true;
  } else {
    // Toggle value
    updatedUserData.settings.tapGraphEnabled = !updatedUserData.settings.tapGraphEnabled;
  }

  // If disabled, do we want to set id back to undefined?
  if (userNodeId) {
    updatedUserData.graphNodeId = userNodeId;
  }

  console.log("Check updatedUserData", updatedUserData)

  createUserDataBackup({
    email: user.email,
    password: session.backupMasterPassword,
    userData: updatedUserData,
  })

  return;
}

export const toggleGraphConsent = async (): Promise<boolean> => {
  const { user, session } = await storage.getUserAndSession();
  if (user &&
    session &&
    session.authTokenValue &&
    session.authTokenExpiresAt > new Date()
  ) {

    // Issues with existing implementation:
    // - seems like db upsert may not be working, lots of edges in the db, feels like too many, may need to delete
    // the entries to rigorously test

    // TODO:
    // 1. true -> false
    // - tapGraphEnabled: to false
    // - edgesBackfilledForUsersWithEnabledFeature: to false, bc if enabled again a new backfill will need to take
    // place
    // - db edges: remove userNodeId
    // - local edges: keep them the same
    // - messages: should userNodeId be removed from another connection's edges? This sounds like a mess, and would
    // require messaging all of them

    // 2. false -> true
    // - tapGraphEnabled: to true
    // - edgesBackfilledForUsersWithEnabledFeature: once backfill run, set to true
    // - db edges: add in userNodeId for existing edges

    await backfillEdgesForTogglingGraphFeature(user, session);

    if (user.edgesBackfilledForUsersWithEnabledFeature && !user.userData.settings?.tapGraphEnabled) {
      // If backfill has taken place and graph has been disabled, removed all userNodeId entries in db while retaining
      // local edge values, and then update edgesBackfilledForUsersWithEnabledFeature to false.
    }

    return true;
  }
  return false;
}