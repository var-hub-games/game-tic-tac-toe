import React, {FC, FormEventHandler, memo, useCallback, useEffect, useState} from "react";
import VarHub from "@varhub-games/tools";
import {Room} from "@varhub-games/tools/dist/Room";
import {useQueryParam} from "../use/useQueryParam";

interface CreateGameProps {
    setRoom: (room: Room) => void;
}
export const CreateGame = memo<CreateGameProps>(({setRoom}) => {
    const baseRoomId = useQueryParam("roomId");
    const baseHost = useQueryParam("host");
    const [creatingRoom, setCreatingRoom] = useState(false);
    const [roomError, retRoomError] = useState<any>(null);

    const createRoom = useCallback(async (host: string, roomId?: string, withPopup?: Window|boolean) => {
        let creating = false;
        setCreatingRoom(v => creating = v);
        if (creating) return;
        setCreatingRoom(true);
        retRoomError(null);
        try {
            const hub = new VarHub(host);
            let room: Room;
            if (roomId) {
                room = await hub.joinRoom(roomId, withPopup);
            } else {
                const url = new URL(location.href);
                url.searchParams.set("host", host);
                room = await hub.createRoom(url.href);
            }
            const url = new URL(location.href);
            url.searchParams.set("host", host);
            url.searchParams.set("roomId", room.id);
            history.replaceState(null, `Room ${room.id}`, url.href);
            setRoom(room);
        } catch (error) {
            retRoomError(error);
        } finally {
            setCreatingRoom(false);
        }
    }, [])

    useEffect(() => {
        if (baseHost && baseRoomId) void createRoom(baseHost, baseRoomId);
    }, []);

    const onSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const host = String(formData.get("host") ?? "");
        const roomId = String(formData.get("roomId") ?? "");
        void createRoom(host, roomId, Boolean(roomError));
    }, [roomError]);

    return (
        <form onSubmit={onSubmit}>
            <div>
                <input name="host" defaultValue={baseHost ?? "https://varhub.myxomopx.ru/"} placeholder="Host url" />
            </div>
            <div>
                <input name="roomId" defaultValue={baseRoomId ?? ""} placeholder="XXX-XXX / blank to new room" />
            </div>
            <div>
                <button type="submit" disabled={creatingRoom}>Join room</button>
            </div>
            {roomError && (
                <div>
                    {String(roomError)}
                </div>
            )}
        </form>
    );
})