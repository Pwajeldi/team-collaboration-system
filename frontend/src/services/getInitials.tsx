export const getInitials = (fullName:string) => {
    return fullName
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const getGreeting = () => {
    const hours = new Date().getHours();
    if(hours < 12){return "Good morning";}
    else if(hours < 17){return "Good afternoon"}
    else{return "Good evening"}
}