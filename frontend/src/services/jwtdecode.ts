import { jwtDecode } from 'jwt-decode'

type jwtPayload = {
    sub: string
}
export const getUserId = () => {
    const token = sessionStorage.getItem("accessToken");
    if(!token) return null;
    const decodedToken = jwtDecode<jwtPayload>(token);
    return decodedToken.sub;
}