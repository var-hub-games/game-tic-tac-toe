import React, {FC, useEffect, useState} from "react";
import {useRoom, useRoomData} from "@varhub-games/tools-react";
import {GamePage} from "./GamePage";

const updatePage = () => location.reload();

export const RoomPage: FC = () => {
    const room = useRoom();
    const { connected } = useRoomData();

    const [roomDisconnectReason, setRoomDisconnectReason] = useState("");

    useEffect(() => {
        if (!connected) {
            void room.connect("main");
        }
    }, [connected]);

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