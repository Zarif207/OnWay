"use client";

import { useState } from "react";
import RiderChat from "@/components/dashboard/RiderChat";
import SupportChat from "@/components/dashboard/SupportChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Chat = () => {
    const { user, isLoading } = useCurrentUser();

    const [activeRide] = useState({
        _id: "69a5f69a18d89b9a3381bbf0"
    });

    if (isLoading) return <div>Loading...</div>;
    if (!user) return <div>Unauthorized</div>;

    return (
        <div>
            {activeRide && activeRide._id && (
                <RiderChat rideId={activeRide._id} user={user} />
            )}

            {user && (
                <SupportChat
                    passengerId={user._id}
                    user={user}
                />
            )}
        </div>
    );
};

export default Chat;