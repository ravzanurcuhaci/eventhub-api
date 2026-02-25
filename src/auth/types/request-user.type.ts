export type RequestUser = {
    id: string;
    email: string;
    role: 'USER' | 'ORGANIZER' | 'ADMIN';
};