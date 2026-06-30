
import React, { useContext, useEffect, useState } from 'react';
import io from "socket.io-client";
import { useMemo } from "react";
import { useGetMyProfileQuery } from '@/redux/api/authApi';
import { API_BASE_URL } from '@/config/api';

type User = {
    _id: string
    name: string
    email: string
    role: string
    profileImage?: string
    status: string
}

interface UserContextType {
    user: User | null;
    socket: any;
    setUser: any;
}

export const UserContext = React.createContext<UserContextType | null>(null);

export const useUser = () => {
    return useContext(UserContext)
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: profile } = useGetMyProfileQuery(undefined)
    const [user, setUser] = useState<User | null>(null);
    const socket = useMemo(() => io(API_BASE_URL), []);


    useEffect(() => {
        const handleConnection = () => {
            console.log("Connected to socket server");
        };

        socket.on("connect", handleConnection);
        return () => {
            socket.off('connect', handleConnection);
        };

    }, [socket]);



    useEffect(() => {
        if (profile) {
            setUser(profile?.data);
        }
    }, [profile])


    return (
        <UserContext.Provider value={{ user, socket, setUser }}>
            {children}
        </UserContext.Provider>
    )
}