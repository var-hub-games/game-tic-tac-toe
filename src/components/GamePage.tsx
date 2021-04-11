import React, {FC, MouseEventHandler, useCallback, useMemo, useState} from "react";
import {
    useDoorKnock,
    useRoom,
    useRoomConnections,
    useRoomData,
    useRoomState,
    useRoomStateSelector
} from "@varhub-games/tools-react";

export const GamePage: FC = () => {
    const room = useRoom();
    const roomData = useRoomData();
    const state = useRoomState();
    const knock = useDoorKnock();

    const initGame = useCallback(() => {
        void room.changeState({
            x: null,
            o: null,
            turn: "x",
            field: {}
        });
    }, [room]);

    if (!roomData.entered) {
        return <div>knock-knock...</div>
    }

    return (
        <>
            {roomData.owned && (
                <div>
                    KNOCK:
                    {Array.from(knock.values()).map(({id, name}) => (
                        <KnockButton key={id} id={id} name={name} />
                    ))}
                </div>
            )}
            {state ? (
                <>
                    <div>
                        <button onClick={initGame}>restart</button>
                    </div>
                    <PlayersGame/>
                </>
            ) : (
                <div>
                    <button onClick={initGame}>INIT GAME</button>
                </div>
            )}

        </>
    )
}

const KnockButton: FC<{id: string, name: string}> = ({id, name}) => {
    const room = useRoom();
    const allow = useCallback(() => {
        void room.door.allow(id);
    }, [room])
    return (
        <button onClick={allow}>{name}</button>
    )
}

const PlayersGame: FC = () => {
    const { connectionId } = useRoomData();
    const connections = useRoomConnections();
    const room = useRoom();

    const x = useRoomStateSelector((state: any) => state?.x);
    const o = useRoomStateSelector((state: any) => state?.o);
    const turn = useRoomStateSelector((state: any) => state?.turn);
    const xConnection = connections.get(x);
    const oConnection = connections.get(o);
    const xName = xConnection?.name;
    const oName = oConnection?.name;

    const joined = connectionId === x || connectionId === o;

    const joinX = useCallback(() => {
        void room.changeState(connectionId, ["x"]);
    }, [room]);

    const joinO = useCallback(() => {
        void room.changeState(connectionId, ["o"]);
    }, [room]);

    const yourRole = connectionId === x ? "x" : connectionId === o ? "o" : null;
    const yourTurn = turn === yourRole;

    const onClick = useCallback((pos) => {
        if (!yourRole || !yourTurn) return;
        void room.modifyState(
            {data: yourRole, path: ["field", pos], ignoreHash: false},
            {data: {x: "o", o:"x"}[yourRole], path: ["turn"], ignoreHash: false},
        );
    }, [yourRole, yourTurn, room]);

    return (
        <div>
            <div>
                X: {xName ? xName : <button onClick={joinX} disabled={joined}>join</button>}
            </div>
            <div>
                O: {oName ? oName : <button onClick={joinO} disabled={joined}>join</button>}
            </div>
            <Field yourTurn={yourTurn} onClick={onClick} yourRole={yourRole}/>
        </div>
    )
}

const winLines = [
    ["00", "01", "02"],
    ["10", "11", "12"],
    ["20", "21", "22"],
    ["00", "10", "20"],
    ["01", "11", "21"],
    ["02", "12", "22"],
    ["00", "11", "22"],
    ["20", "11", "02"],
]
const allLines = ["00", "01", "02", "10", "11", "12","20", "21", "22",]
const Line = ["0", "1", "2"];
interface FieldProps {
    yourTurn: boolean,
    yourRole: string|null,
    onClick: (pos: string) => void
}
const Field: FC<FieldProps> = ({yourTurn, onClick, yourRole}) => {
    const field = useRoomStateSelector((state: any) => state?.field);
    const room = useRoom();

    const [winState, winPos] = useMemo<[string|null, string[]|null]>(() => {
        if (!field) return [null, null];
        const winX = winLines.find(positions => {
            return positions.every(pos => field[pos] === "x");
        })
        const winO = winLines.find(positions => {
            return positions.every(pos => field[pos] === "o");
        })
        const draw = allLines.every(pos => field[pos] != null);
        if (yourRole === "x" && winX) return ["win", winX ?? null]
        if (yourRole === "o" && winO) return ["win", winO ?? null]
        const winSomeOther = winX || winO;
        if (winSomeOther) return ["loose", winSomeOther]
        if (draw) return ["draw", null]
        return [null, null]
    }, [field, yourRole]);

    const restart = useCallback(() => {
        void room.modifyState(
            {data: {}, path: ["field"], ignoreHash: false},
            {data: Math.random() > 0.5 ? "x" : "o", path: ["turn"], ignoreHash: false}
        )
    }, [room])



    return (
        <div>
            <div>
                <table>
                    <tbody>
                        {Line.map(r => (
                            <tr key={r}>
                                {Line.map(d => (
                                    <td key={d}>
                                        <Block
                                            pos={r+d}
                                            allowClick={yourTurn && !winState}
                                            onClick={onClick}
                                            light={Boolean(winPos && winPos.includes(r+d))}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {winState && (
                <div>
                    {winState} <button onClick={restart}>restart</button>
                </div>
            )}
        </div>
    );
}

interface BlockProps {
    pos: string;
    allowClick: boolean;
    onClick: (pos: string) => void
    light: boolean
}
const Block: FC<BlockProps> = ({pos, onClick, allowClick, light}) => {
    const value = useRoomStateSelector((state: any) => state?.field?.[pos]);
    const onClickButton = useCallback(() => {
        if (!allowClick) return;
        onClick(pos);
    }, [pos, onClick]);
    return (
        <button onClick={onClickButton} disabled={!light && (value || !allowClick)} >{value ?? "~"}</button>
    )
}

