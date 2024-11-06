
import { SlideVideoParameters } from "../utils/Interfaces";
import { log, progress } from "../utils/Functions";

export default class SlideVideo {
    public video: HTMLVideoElement;
    private progress: HTMLProgressElement;
    public identifier: string = "";
    public videoDuration: number = 0;
    public videoTime: number = 0;
    public videoTotal: number = 0;
    private source: string = "";
    private attributes: string[] = [];

    constructor(parameters: SlideVideoParameters = { identifier: "", source: "", attributes: [] }) {
        this.video = document.createElement("video");
        this.progress = document.createElement("progress");
        this.identifier = parameters.identifier;
        this.source = parameters.source;
        this.attributes = parameters.attributes;
    }
    render() {
        log("Video " + this.identifier + " rendered.", true);
        //const video = document.createElement("video");
        this.attributes.forEach(attribute => {
            this.video.setAttribute(attribute, "");
        });
        const source = document.createElement("source");
        source.src = import.meta.env.VITE_BASE_URL + "/vid/" + this.source;
        source.type = "video/mp4";
        this.video.appendChild(source);
        this.video.addEventListener("loadedmetadata", () => {
            this.videoTotal = this.video.duration;
            log("'" + this.identifier + "' duration: " + this.videoTotal + "s", true);
        });
        this.video.addEventListener("timeupdate", () => {
            this.videoTime = Math.floor(this.video.currentTime);
            this.progress = document.querySelector("#" + this.identifier + " .overlay progress") as HTMLProgressElement;
            this.progress.value = progress(this.videoTime, this.videoTotal);
        });
        const videoNode: Node = this.video;
        return videoNode;
    }
    public start() {
        this.video.play();
    }
    public stop() {
        this.video.pause();
    }
    public rewind() {
        this.video.currentTime = 0;
    }
    public go(seconds: number) {
        this.video.currentTime = seconds;
    }

}