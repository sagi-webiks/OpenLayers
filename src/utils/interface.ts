import { Icon, Style } from "ol/style";

export const iconStyle = (icon: string) => {
    return new Style({
        image: new Icon({
            src: icon,

        }),
    });
}

export const hoverStyle = (icon: string) => {
    return new Style({
        image: new Icon({
            src: icon,
            scale: 1.1
        }),
    });
}