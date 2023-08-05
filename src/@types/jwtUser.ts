interface jwtUser {
    id: string,
    accessToken: string,
    iat: number,
    exp: number
}

export default jwtUser;
