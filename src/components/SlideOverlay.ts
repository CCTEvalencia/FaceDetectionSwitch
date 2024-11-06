import { SlideOverlayParameters } from "../utils/Interfaces";
import { log } from "../utils/Functions";

export default class SlideOverlay {
    public overlay: HTMLDivElement;
    private heading: string = "";
    private description: string = "";
    public withProgress: boolean = true;
    public status: string = "";
    constructor(parameters: SlideOverlayParameters = { heading: "", description: "", withProgress: true, status: "" }) {
        this.overlay = document.createElement("div");
        this.heading = parameters.heading;
        this.description = parameters.description;
        this.withProgress = parameters.withProgress;
        this.status = parameters.status;
    }
    render() {
        log("Overlay " + this.heading + " rendered.", true);
        this.overlay.classList.add("overlay")
        if (this.status != "") {
            this.overlay.classList.add(this.status);
        }
        const heading = document.createElement("h1");
        heading.innerText = this.heading;
        const description = document.createElement("p");
        description.innerText = this.description;
        this.overlay.appendChild(description);
        this.overlay.appendChild(heading);
        if (this.withProgress) {
            const progress = document.createElement("progress");
            progress.max = 100;
            this.overlay.appendChild(progress);
        }
        const overlayNode: Node = this.overlay;
        return overlayNode;
    }
    show() {
        this.overlay.classList.remove("hidden")
    }
}