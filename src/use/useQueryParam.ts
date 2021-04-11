import {useEffect, useState} from "react";

function parseQueryParam(location: Location, name: string): null | string {
    const search = location.search.substring(1);
    if (!search) return null;
    const t = new URLSearchParams(search);
    return t.get(name);
}

export function useQueryParam(name: string): string|null{
    const [value, setValue] = useState(() => parseQueryParam(location, name))
    useEffect(() => {
        const listener = () => {
            setValue(parseQueryParam(location, name));
        }
        window.addEventListener('popstate', listener);
        return () => window.removeEventListener('popstate', listener);
    }, [name]);
    return value;
}