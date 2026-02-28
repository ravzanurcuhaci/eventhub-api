import { Role } from "src/auth/roles.enum";

export type RequestUser = {
    id: string;
    email: string;
    role: Role;
};