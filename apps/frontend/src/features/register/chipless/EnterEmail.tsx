import React, { useState } from "react";
import { EmailSchema, errorToString } from "@types";
import { toast } from "sonner";
import { AppButton } from "@/components/ui/Button";
import { AppInput } from "@/components/ui/AppInput";
import { RegisterHeader } from "../../../components/ui/RegisterHeader";
import { AppCopy } from "@/components/ui/AppCopy";
import { SupportToast } from "@/components/ui/SupportToast";
import { ERROR_SUPPORT_CONTACT } from "@/constants";

interface EnterEmailProps {
  submitEmail: (email: string) => Promise<void>;
  defaultEmail?: string;
}

const EnterEmail: React.FC<EnterEmailProps> = ({
  submitEmail,
  defaultEmail = "",
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      EmailSchema.parse(email);
      await submitEmail(email);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast(
        SupportToast(
          "",
          true,
          "Please enter a valid email address",
          ERROR_SUPPORT_CONTACT,
          errorToString(error)
        )
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
  };

  return (
    <div className="flex flex-col grow">
      <RegisterHeader
        title="Discover & deepen your connections."
        description={
          <div className="flex flex-col gap-2">
            <span>
              {`Use programmable cryptography to connect safely and expressively with others -- find your conspirators and co-schemers.`}
            </span>
          </div>
        }
      />
      <div className="flex flex-col mt-auto">
        <form onSubmit={handleSubmit} className="space-y-4 pb-2">
          <div className="text-center mt-1">
            <AppInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              required
              value={email}
              onChange={handleChange}
            />
          </div>

          <AppButton loading={loading} type="submit">
            Next
          </AppButton>
        </form>
        <AppCopy className="text-center py-4" />
      </div>
    </div>
  );
};

export default EnterEmail;