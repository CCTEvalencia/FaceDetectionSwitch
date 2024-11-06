import { WebcamParameters } from "../utils/Interfaces";
import { log } from "../utils/Functions";

import {
    FaceDetector,
    FilesetResolver,
} from "@mediapipe/tasks-vision";
declare type RunningMode = "IMAGE" | "VIDEO";

export default class WebcamFeed {
    public viewer: HTMLDivElement;
    public attributes: string[];
    public identifier: string;
    public videoFeed: HTMLVideoElement;
    public lastVideoTime: number;
    public ctaTimer: number;
    public ctaSlide: HTMLDivElement;
    public ctaVideo: HTMLVideoElement;
    public reactionSlide: HTMLDivElement;
    public reactionVideo: HTMLVideoElement;
    public reactionFinished: boolean;
    public reactionTriggered: boolean;
    private faceDetector?: FaceDetector;
    public runningMode: RunningMode = "VIDEO";

    constructor(parameters: WebcamParameters) {
        this.identifier = parameters.identifier;
        this.attributes = parameters.attributes;
        this.viewer = document.createElement("div");
        this.videoFeed = document.createElement("video");
        this.ctaSlide = document.createElement("div");
        this.ctaVideo = document.createElement("video");
        this.reactionSlide = document.createElement("div");
        this.reactionVideo = document.createElement("video");
        this.reactionFinished = true;
        this.lastVideoTime = -1;
        this.ctaTimer = 50;
        this.reactionTriggered = false;

    }
    render() {
        log("Webfeed " + this.identifier + " rendered.", true);
        this.viewer.id = this.identifier;
        this.viewer.classList.add("window");
        if (this.attributes.length > 0) {
            this.attributes.forEach((attribute: string) => {
                this.viewer.classList.add(attribute);
            })
        }
        this.videoFeed.id = "feed";
        this.videoFeed.setAttribute("autoplay", "");
        this.videoFeed.setAttribute("playsinline", "");
        this.videoFeed.setAttribute("loop", "");
        this.viewer.appendChild(this.videoFeed);
        const viewerNode: Node = this.viewer;
        return viewerNode;
    }
    public async initializeDetector() {
        const vision = await FilesetResolver.forVisionTasks("./wasm/");
        this.faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `./models/blaze_face_short_range.tflite`,
                delegate: "GPU",
            },
            runningMode: this.runningMode,
        });
        log("Created FaceDetector from model", true);
    }
    enableFeed() {
        // Activate the webcam stream.
        log("Enabling camera", true);
        const constraints = {
            video: { width: 1920, height: 1080 },
            audio: false,
        };
        const timestamp: DOMHighResTimeStamp = 0;
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
                this.videoFeed.srcObject = stream;
                this.videoFeed.addEventListener("loadeddata", () => { if (this.faceDetector) { this.predictVideoFeed(timestamp, this.faceDetector) } });
            })
            .catch((err) => {
                console.error(err);
            });
        // Identify moving elements
        this.reactionSlide = document.getElementById("slide02") as HTMLDivElement;
        this.reactionVideo = this.reactionSlide.querySelector("video") as HTMLVideoElement;
        this.reactionVideo.addEventListener("ended", () => {
            this.ctaTimer = 50;
            this.reactionTriggered = false;
            this.reactionFinished = true
        })
    }
    public async startDetection(event?: Event) {
        log("Enabling face detection", true);
        if (!this.faceDetector) {
            log("FaceDetector is still loading. Re-trying in 10s", true);
            setTimeout(() => {
                this.startDetection(event);
            }, 10000);
            return;
        } else {
            this.enableFeed();
        }

        // Activate the webcam stream.
    }
    public async predictVideoFeed(timestamp: DOMHighResTimeStamp, faceDetector: FaceDetector) {
        log("In Action: " + timestamp, true, "actionStatus")
        if (this.reactionFinished && this.faceDetector) {
            //await this.faceDetector.setOptions({ runningMode: "VIDEO" });
            let startTimeMs = performance.now();
            // Detect faces using detectForVideo
            if (this.videoFeed.currentTime !== this.lastVideoTime) {
                this.lastVideoTime = this.videoFeed.currentTime;
                const detections = faceDetector.detectForVideo(
                    this.videoFeed,
                    startTimeMs
                ).detections;
                log("Detected faces: " + detections.length, true, "detections");
                if (detections.length > 0) {
                    const score = parseFloat(detections[0].categories[0].score + "");
                    const confidence = Math.round(score) * 100;
                    log("Confidence: " + confidence + "%", true, "confidence")
                    if (this.ctaTimer == 0) {
                        if (!this.reactionTriggered) {
                            this.reactionVideo.currentTime = 0;
                            this.reactionVideo.play();
                            this.reactionSlide.classList.remove("hidden");
                            this.reactionFinished = false;
                            this.reactionTriggered = true;
                        }
                    } else {
                        if (this.reactionFinished) {
                            this.reactionSlide.classList.add("hidden");
                        }
                        this.ctaTimer -= 1;
                    }
                } else {
                    if (this.reactionFinished) {
                        this.ctaTimer = 50;
                    }
                }
                log("CTA Timer: " + this.ctaTimer, true, "ctaTimer");
            }
            log("Reaction Status: " + this.reactionFinished, true, "reactionStatus")
        }
        window.requestAnimationFrame((timestamp) => this.predictVideoFeed(timestamp, faceDetector));
    }
    show() {
        console.log("showing webcam")
        this.viewer.classList.remove("hidden")
    }
    stopDetection() {

    }
}
