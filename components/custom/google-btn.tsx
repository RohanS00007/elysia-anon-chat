"use client";
import Image from "next/image";
import { Button } from "../ui/button";
import googleImage from "@/public/search.png";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const googleLogin = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
  });
};

export default function GoogleBtn() {
  return (
    <Button
      onClick={googleLogin}
      className={cn(
        "flex cursor-pointer ring-1 ring-blue-400 hover:scale-105 active:scale-95 dark:bg-black",
      )}
      variant={"outline"}
    >
      <Image src={googleImage} alt="Google logo" width={20} height={20} />
      <p>Google</p>
    </Button>
  );
}
