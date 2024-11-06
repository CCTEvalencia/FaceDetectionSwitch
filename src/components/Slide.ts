import SlideVideo from "./SlideVideo";
import SlideOverlay from "./SlideOverlay";
import { log } from "../utils/Functions";
import { SlideParameters, SlideVideoParameters, SlideOverlayParameters } from "../utils/Interfaces";

export default class Slide {
    private identifier = "";
    private videoParameters: SlideVideoParameters = { identifier: "", source: "", attributes: [] };
    private overlayParameters: SlideOverlayParameters = { heading: "", description: "", withProgress: true, status: "" };
    private status: string = "";

    constructor(parameters: SlideParameters) {
        this.identifier = parameters.identifier;
        this.videoParameters = parameters.videoParameters;
        this.overlayParameters = parameters.overlayParameters;
        this.status = parameters.status;
    }
    render() {
        log("Slide " + this.identifier + " rendered.", true);
        const slide = document.createElement("div");
        slide.id = this.identifier;
        slide.classList.add("slide", "fullscreen");
        if (this.status != "") {
            slide.classList.add(this.status);
        }
        const videoContainerParameters: SlideVideoParameters = this.videoParameters;
        const videoContainer = new SlideVideo(videoContainerParameters);
        const labelContainerParameters: SlideOverlayParameters = this.overlayParameters;
        const labelContainer = new SlideOverlay(labelContainerParameters);
        slide.appendChild(videoContainer.render());
        slide.appendChild(labelContainer.render());
        return slide;
    }
}