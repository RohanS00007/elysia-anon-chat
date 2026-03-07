"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { authClient } from "@/lib/auth-client";
import ImpersonateUser from "./user-impersonation";
import UserRoleEdit from "./edit-user-role";
import DeleteUser from "./delete-user";
import { useQuery } from "@tanstack/react-query";

export default function UsersTanstackTable() {
  const loadUsers = async () => {
    const response = await authClient.admin.listUsers({
      query: { sortBy: "name" },
    });
    return response?.data?.users ?? [];
  };

  let counter = 1;

  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: loadUsers,
    staleTime: Infinity,
  });

  if (usersData.isLoading) {
    return (
      <div className="flex justify-center p-4">
        <span>Loading users from database...</span>
      </div>
    );
  }
  if (usersData.isError) {
    return (
      <div>
        <p>{String(usersData.error.message)}</p>
      </div>
    );
  }

  return (
    <Table className="border-amber-700">
      <TableHeader>
        <TableRow>
          <TableHead>S.No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(usersData.data ?? []).map((user) => (
          <TableRow key={user.id}>
            <TableCell>{counter++}</TableCell>
            <TableCell>
              <div className="flex justify-evenly">
                <p className="flex-1">{user.name}</p>
                {user.role === "admin" ? null : (
                  <DeleteUser userId={user.id as string} />
                )}
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <div className="flex w-30 place-content-center items-center justify-evenly px-2">
                <UserRoleEdit userID={user.id as string} classname="" />
                <p
                  className={
                    user.role === "admin" ? "text-blue-600" : "text-neutral-600"
                  }
                >
                  {user.role}
                </p>
              </div>
            </TableCell>
            <TableCell
              className={user.emailVerified ? "text-green-600" : "text-red-600"}
            >
              {user.emailVerified ? "Yes" : "No"}
            </TableCell>
            <TableCell>
              {user.banned ? (
                <span className="text-red-500">Banned</span>
              ) : (
                <span className="text-green-500">Active</span>
              )}
            </TableCell>
            <TableCell>
              <ImpersonateUser userId={user.id as string} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
