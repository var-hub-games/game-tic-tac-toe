import React, {FC, useEffect, useState} from "react";
import {useRoom, useRoomData, useRoomEvent} from "@varhub-games/tools-react";
import {GamePage} from "./GamePage";

const updatePage = () => location.reload();

export const RoomPage: FC = () => {
    const room = useRoom();
    const { connected } = useRoomData();

    const [roomDisconnectReason, setRoomDisconnectReason] = useState("");

    useRoomEvent("disconnect", event => {
        setRoomDisconnectReason(String(event.detail));
    });

    useEffect(() => {
        if (!connected) {
            void room.connect("main");
        }
    }, []);

    if (!connected && roomDisconnectReason) {
        return <>
            <div>disconnected: {roomDisconnectReason}</div>
            <button onClick={updatePage}>update</button>
        </>
    }

    if (!connected) {
        return <>connecting...</>
    }

    return <GamePage/>
}