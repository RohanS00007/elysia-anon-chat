"use client";
import Image from "next/image";
import { Button } from "../ui/button";
import lightmodeGithubImage from "@/public/github-logo.png";
import darkmodeGithubImage from "@/public/GitHub_Invertocat_White.png";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const gitHubLogin = async () => {
  await authClient.signIn.social({
    provider: "github",
    callbackURL: "/dashboard",
  });
};

export default function GitHubBtn() {
  return (
    <Button
      onClick={gitHubLogin}
      className={cn(
        "relative flex cursor-pointer ring-1 ring-blue-400 hover:scale-105 active:scale-95 dark:bg-black",
      )}
      variant={"outline"}
    >
      {/* light mode image (visible when dark mode is off) */}
      <Image
        src={lightmodeGithubImage}
        alt="Github logo"
        width={20}
        height={20}
        className="rounded-full bg-white mask-t-from-10 mask-r-from-10 mask-b-from-10 mask-l-from-10 dark:hidden"
      />
      {/* dark mode image (visible when dark mode is active) */}
      <Image
        src={darkmodeGithubImage}
        alt="Github logo"
        width={20}
        height={20}
        className="hidden rounded-full bg-black mask-t-from-10 mask-r-from-10 mask-b-from-10 mask-l-from-10 dark:block"
      />
      <p>Github</p>
    </Button>
  );
}
