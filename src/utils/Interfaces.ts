export interface SlideVideoParameters {
    identifier: string;
    source: string;
    attributes: string[];
}
export interface SlideOverlayParameters {
    heading: string;
    description: string;
    withProgress: boolean;
    status: string;
}
export interface WebcamParameters {
    identifier: string;
    attributes: string[];
}
export interface LoggerParameters {
    identifier: string;
    attributes: string[];
}
export interface SlideParameters {
    identifier: string,
    videoParameters: SlideVideoParameters,
    overlayParameters: SlideOverlayParameters,
    status: string
}
