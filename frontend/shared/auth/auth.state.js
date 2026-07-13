import { getSession } from "./token.storage.js";

export function isAuthenticated() {

    const session = getSession();

    return session !== null;

}