import { WebcamParameters } from "../utils/Interfaces";
import { log } from "../utils/Functions";
import {
    PoseLandmarker,
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
    private poseDetector?: PoseLandmarker;
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
        switch (window.Detection) {
            case "pose":
                this.poseDetector = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `./models/pose_landmarker_lite.task`,
                        delegate: "GPU",
                    },
                    runningMode: this.runningMode,
                    numPoses: 2
                });
                break;
            default:
                this.faceDetector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `./models/blaze_face_short_range.tflite`,
                        delegate: "GPU",
                    },
                    runningMode: this.runningMode,
                });
                break;
        }
        log("Created Detector from model", true);
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
                switch (window.Detection) {
                    case "pose":
                        this.videoFeed.addEventListener("loadeddata", () => { if (this.poseDetector) { this.predictPoseVideoFeed(timestamp, this.poseDetector) } });
                        break;
                    default: //face
                        this.videoFeed.addEventListener("loadeddata", () => { if (this.faceDetector) { this.predictFaceVideoFeed(timestamp, this.faceDetector) } });
                        break;
                }

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
        switch (window.Detection) {
            case "pose":
                if (!this.poseDetector) {
                    log("Detector is still loading. Re-trying in 10s", true);
                    setTimeout(() => {
                        this.startDetection(event);
                    }, 10000);
                    return;
                } else {
                    this.enableFeed();
                }
                break;
            default:
                if (!this.faceDetector) {
                    log("Detector is still loading. Re-trying in 10s", true);
                    setTimeout(() => {
                        this.startDetection(event);
                    }, 10000);
                    return;
                } else {
                    this.enableFeed();
                }
                break;
        }


        // Activate the webcam stream.
    }
    public async predictFaceVideoFeed(timestamp: DOMHighResTimeStamp, faceDetector: FaceDetector) {
        log("Frame timestamp: " + timestamp, true, "actionStatus")
        if (this.reactionFinished && this.faceDetector) {
            //await this.featureDetector.setOptions({ runningMode: "VIDEO" });
            let startTimeMs = performance.now();
            // Detect faces using detectForVideo
            if (this.videoFeed.currentTime !== this.lastVideoTime) {
                this.lastVideoTime = this.videoFeed.currentTime;
                const detections = faceDetector.detectForVideo(
                    this.videoFeed,
                    startTimeMs
                ).detections;
                log("Detections: " + detections.length, true, "detections");
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
        window.requestAnimationFrame((timestamp) => this.predictFaceVideoFeed(timestamp, faceDetector));
    }
    public async predictPoseVideoFeed(timestamp: DOMHighResTimeStamp, poseDetector: PoseLandmarker) {
        log("Frame timestamp: " + timestamp, true, "actionStatus")
        if (this.reactionFinished && this.poseDetector) {
            //await this.featureDetector.setOptions({ runningMode: "VIDEO" });
            let startTimeMs = performance.now();
            // Detect faces using detectForVideo
            if (this.videoFeed.currentTime !== this.lastVideoTime) {
                this.lastVideoTime = this.videoFeed.currentTime;
                const detections = poseDetector.detectForVideo(
                    this.videoFeed,
                    startTimeMs,
                    (result) => {
                        console.log(result.landmarks.length);
                        if (result.landmarks.length > 0) {
                            const score = 1; //parseFloat(detections[0].categories[0].score + "");
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
                    }
                );
                log("Detections: " + detections, true, "detections");
                /*
                
                    */

                log("CTA Timer: " + this.ctaTimer, true, "ctaTimer");
            }
            log("Reaction Status: " + this.reactionFinished, true, "reactionStatus")
        }
        window.requestAnimationFrame((timestamp) => this.predictPoseVideoFeed(timestamp, poseDetector));
    }
    show() {
        console.log("showing webcam")
        this.viewer.classList.remove("hidden")
    }
    stopDetection() {

    }
}
