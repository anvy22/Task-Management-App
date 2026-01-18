"use client"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSocket } from "@/components/providers/SocketProvider"



import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"


export interface User {
  _id: string,
  name: string,
  email: string,
  role: string,
  firebaseUid: string,
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { onlineUsers } = useSocket();

  const router = useRouter();


  useEffect(() => {
    fetchData();
  }, [])

  async function fetchData() {
    try {

      const result = await api.get("/users");
      setUsers(result.data);

    } catch (error) {
      toast.error("Something went wrong")
      console.log("Error in fetching users data");
    } finally {
      setLoading(false);
    }
  }

  const isUserOnline = (firebaseUid: string) => {
    return onlineUsers.includes(firebaseUid);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Users
          <span className="text-sm font-normal text-muted-foreground">
            ({onlineUsers.length} online)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-full rounded-md border">
          {
            loading ? (
              <div className="space-y-3 p-4">
                {
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))
                }
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {
                    users.map((user) => (
                      <TableRow key={user._id} className="cursor-pointer hover:bg-muted/50 transition"
                        onClick={() => router.push(`/dashboard/users/${user._id}`)}>

                        <TableCell className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback>
                                {user.name.charAt(0).toLocaleUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${isUserOnline(user.firebaseUid)
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                                }`}
                              title={isUserOnline(user.firebaseUid) ? "Online" : "Offline"}
                            />
                          </div>
                          <span className="font-medium ">
                            {user.name}
                          </span>
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={isUserOnline(user.firebaseUid) ? "default" : "outline"}
                            className={isUserOnline(user.firebaseUid) ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {isUserOnline(user.firebaseUid) ? "Online" : "Offline"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>

                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            )
          }
        </ScrollArea>
      </CardContent>
    </Card>
  )
}