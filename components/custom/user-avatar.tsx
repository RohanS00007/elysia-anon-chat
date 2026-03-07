import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { useAuthInfo } from "./auth-query-provider";

export default function UserAvatar() {
  const authData = useAuthInfo();
  const user = authData?.data?.user;

  if (authData?.isLoading) return <Skeleton className="size-10 rounded-full" />;
  if (authData?.isError) return <p>{authData.error?.message}</p>;

  if (user?.image) {
    return (
      <Image
        className="size-7 rounded-full"
        src={user.image}
        height={50}
        width={50}
        alt="profile picture"
      />
    );
  }

  if (user) {
    const initial = user.username ? user.username.charAt(0).toUpperCase() : "?";
    return (
      <div className="flex size-10 items-center justify-center rounded-full bg-black text-2xl text-white">
        {initial}
      </div>
    );
  }
  return null;
}
