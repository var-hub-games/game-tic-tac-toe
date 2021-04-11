import React, {FC, useState} from "react";
import {CreateGame} from "./CreateGame";
import {Room} from "@varhub-games/tools/dist/Room";
import {RoomProvider} from "@varhub-games/tools-react";
import {RoomPage} from "./RoomPage";

export const App: FC = () => {
    const [room, setRoom] = useState<Room|null>(null);

    if (!room) {
        return <CreateGame setRoom={setRoom}/>
    }

    return (
        <RoomProvider room={room}>
            <RoomPage/>
        </RoomProvider>
    );
}