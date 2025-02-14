"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { errorToString, UsernameSchema } from "@types";
import EnterUserInfo from "@/features/register/chipless/EnterUserInfo";
import RegisterWithPassword from "@/features/register/chipless/RegisterWithPassword";
import { requestSigninToken, verifyEmailIsUnique, verifySigninToken, verifyUsernameIsUnique } from "@/lib/auth/util";
import { applyBackupsToChiplessNewUser, registerUser } from "@/lib/auth/register";
import useSettings from "@/hooks/useSettings";
import { HeaderCover } from "@/components/ui/HeaderCover";
import { logClientEvent } from "@/lib/frontend/metrics";
import { SupportToast } from "@/components/ui/SupportToast";
import { ERROR_SUPPORT_CONTACT } from "@/constants";
import { zxcvbn } from "@zxcvbn-ts/core";
import CreatingAccount from "./CreatingAccount";
import EnterEmail from "@/features/register/chipless/EnterEmail";
import EnterCode from "@/features/register/chipless/EnterCode";

enum DisplayState {
  ENTER_EMAIL,
  ENTER_CODE,
  ENTER_USER_INFO,
  REGISTER_WITH_PASSWORD,
  CREATING_ACCOUNT,
}

const RegisterChipless: React.FC = () => {
  const router = useRouter();
  const { pageHeight } = useSettings();
  const [displayState, setDisplayState] = useState<DisplayState>(
    DisplayState.ENTER_EMAIL
  );
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleEmailSubmit = async (submittedEmail: string) => {
    logClientEvent("register-email-submit", {});
    const isUnique = await verifyEmailIsUnique(submittedEmail);
    if (!isUnique) {
      toast.error("Email is already in use");
      return;
    }

    try {
      await requestSigninToken(submittedEmail);
    } catch (error) {
      console.error(error);
      toast(
        SupportToast(
          "",
          true,
          "Error requesting signin token",
          ERROR_SUPPORT_CONTACT,
          errorToString(error)
        )
      );
    }

    setEmail(submittedEmail);
    setDisplayState(DisplayState.ENTER_CODE);
  };

  const handleCodeSubmit = async (submittedCode: string) => {
    logClientEvent("register-code-submit", {});
    try {
      const isValid = await verifySigninToken(email, submittedCode);
      if (!isValid) {
        toast.error("Invalid code");
        return;
      }

      setDisplayState(DisplayState.ENTER_USER_INFO);
    } catch (error) {
      toast(
        SupportToast(
          "",
          true,
          "Cannot verify signin code",
          ERROR_SUPPORT_CONTACT,
          errorToString(error)
        )
      );
      return;
    }
  };

  const handleUserInfoSubmit = async (userInfo: {
    displayName: string;
    bio: string;
    telegramHandle: string;
    twitterHandle: string;
  }) => {
    logClientEvent("register-user-info-submit", {});

    setDisplayName(userInfo.displayName);
    setBio(userInfo.bio);
    setTelegramHandle(userInfo.telegramHandle);
    setTwitterHandle(userInfo.twitterHandle);
    setDisplayState(DisplayState.REGISTER_WITH_PASSWORD);
  };

  const handleRegisterWithPassword = async (
    username: string,
    password: string
  ) => {
    // Check username is valid
    let parsedUsername;
    try {
      parsedUsername = UsernameSchema.parse(username);
    } catch (error) {
      toast.error("Invalid username");
      console.error(error);
      return;
    }
    const usernameIsUnique = await verifyUsernameIsUnique(parsedUsername);
    if (!usernameIsUnique) {
      toast.error("Username is already taken");
      return;
    }

    // Check password strength
    const passwordCheck = zxcvbn(password);

    // 3 # safely unguessable: moderate protection from offline slow-hash scenario. (guesses < 10^10)
    // https://github.com/dropbox/zxcvbn/blob/master/README.md
    if (passwordCheck && passwordCheck.score < 3) {
      toast.error(
        "Weak password, try adding numbers, symbols, and using less common words."
      );
      return;
    }

    logClientEvent("register-register-with-password", {});
    await handleCreateAccount(username, password, false, undefined);
  };

  const handleCreateAccount = async (
    username: string,
    backupPassword: string,
    registeredWithPasskey: boolean,
    authPublicKey: string | undefined
  ) => {
    logClientEvent("register-create-account", {});

    setDisplayState(DisplayState.CREATING_ACCOUNT);
    setIsCreatingAccount(true);
    try {
      await registerUser({
        email,
        password: backupPassword,
        username,
        displayName,
        bio,
        telegramHandle,
        twitterHandle,
        registeredWithPasskey: registeredWithPasskey,
        passkeyAuthPublicKey: authPublicKey,
      });

      // This is the only place where accountless backups should be applied
      // Backups will only be applied if an unregistered user exists (which will only happen if an accountless client
      // goes through the tap flow)
      await applyBackupsToChiplessNewUser(
        backupPassword,
      );

      setIsCreatingAccount(false);
    } catch (error) {
      setDisplayState(DisplayState.REGISTER_WITH_PASSWORD);
      logClientEvent("register-create-account-error", {
        error: errorToString(error),
      });
      console.error(error);
      toast(
        SupportToast(
          "",
          true,
          "Failed to create account. Please try again",
          ERROR_SUPPORT_CONTACT,
          errorToString(error)
        )
      );
      return;
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleFinishCreatingAccount = () => {
    // Show success toast and redirect to home
    toast.success("Account created successfully!");
    router.push("/profile");
  };

  const onGoBack = () => {
    if (displayState === DisplayState.REGISTER_WITH_PASSWORD) {
      setDisplayState(DisplayState.ENTER_USER_INFO);
    }
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{
        minHeight: `${pageHeight}px`,
      }}
    >
      {[
        DisplayState.ENTER_EMAIL,
        DisplayState.ENTER_CODE,
        DisplayState.ENTER_USER_INFO,
        DisplayState.REGISTER_WITH_PASSWORD,
        DisplayState.CREATING_ACCOUNT,
      ].includes(displayState) && (
        <HeaderCover
          // isLoading={[DisplayState.CREATING_ACCOUNT].includes(displayState)}
          isLoading={isCreatingAccount}
        />
      )}
      <div className="flex-grow flex px-6 center sm:mx-auto sm:w-full sm:max-w-md">
        {displayState === DisplayState.ENTER_EMAIL && (
          <EnterEmail defaultEmail={email} submitEmail={handleEmailSubmit} />
        )}
        {displayState === DisplayState.ENTER_CODE && (
          <EnterCode email={email} submitCode={handleCodeSubmit} />
        )}
        {displayState === DisplayState.ENTER_USER_INFO && (
          <EnterUserInfo
            displayName={displayName}
            bio={bio}
            telegramHandle={telegramHandle}
            twitterHandle={twitterHandle}
            onSubmit={handleUserInfoSubmit}
          />
        )}
        {displayState === DisplayState.REGISTER_WITH_PASSWORD && (
          <RegisterWithPassword
            onSubmit={handleRegisterWithPassword}
            onGoBack={onGoBack}
          />
        )}
        {displayState === DisplayState.CREATING_ACCOUNT && (
          <CreatingAccount
            isCreatingAccount={isCreatingAccount}
            handleFinishCreatingAccount={handleFinishCreatingAccount}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterChipless;
