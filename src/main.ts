import './style.css'
import Slide from './components/Slide';
import WebcamFeed from './components/WebcamFeed';
import Logger from './components/Logger';
import { SlideVideoParameters, SlideOverlayParameters } from './utils/Interfaces';
import { log, mode, action } from './utils/Functions'
const visibility: string = (mode("debug")) ? "visible" : "hidden";
const app = document.querySelector<HTMLDivElement>('#app');
const webcam = new WebcamFeed({ identifier: "viewer", attributes: [visibility] });
const slide01VideoParameters: SlideVideoParameters = { identifier: "slide01", source: "cta.mp4", attributes: ["muted", "loop", "autoplay"] };
const slide01OverlayParameters: SlideOverlayParameters = { heading: "Slide 1", description: "Call to Action", withProgress: true, status: visibility };
const slide01 = new Slide({ identifier: "slide01", videoParameters: slide01VideoParameters, overlayParameters: slide01OverlayParameters, status: "" });
const slide02VideoParameters: SlideVideoParameters = { identifier: "slide02", source: "reaction.mp4", attributes: ["muted"] };
const slide02OverlayParameters: SlideOverlayParameters = { heading: "Slide 2", description: "Face Reaction", withProgress: true, status: visibility };
const slide02 = new Slide({ identifier: "slide02", videoParameters: slide02VideoParameters, overlayParameters: slide02OverlayParameters, status: "hidden" });
const logger = new Logger({ identifier: "logger", attributes: [visibility] });
let BroadSignObject: Object = {};

declare global {
    interface Window {
        BroadSignPlay: () => void;
        DebugMode: boolean;
        PlayerEnv: boolean;
        IgnoreCache: boolean;
    }
}

if (app) {
    app.appendChild(webcam.render());
    app.appendChild(slide01.render());
    app.appendChild(slide02.render());
    app.appendChild(logger.render());
    window.BroadSignPlay = () => {
        log("BroadSignPlay() function executed", true);
        webcam.startDetection();
        return true;
    }
    document.addEventListener('DOMContentLoaded', () => {
        webcam.initializeDetector();
        window.DebugMode = mode("debug");
        window.IgnoreCache = action("cache");
        window.PlayerEnv = (Object.keys(BroadSignObject).length > 1) ? true : false;
        const path = window.location.hostname;
        const isRemote = path.includes("ccplay");
        const pathRoot = (isRemote) ? "/test/facedetection/" : "/dist/";
        // *** Unregister Service Worker
        if (window.IgnoreCache) {
            navigator.serviceWorker.ready.then(function (registration) {
                registration.unregister().then(function () {
                    console.log('Service worker unregistered successfully.');
                    caches.keys().then(function (cacheNames) {
                        return Promise.all(
                            cacheNames.map(function (cacheName) {
                                return caches.delete(cacheName);
                            })
                        );
                    });
                }).catch(function (error) {
                    console.error('Error unregistering service worker:', error);
                });
            });
        } else {
            if ((isRemote || window.DebugMode) && "serviceWorker" in navigator) {
                navigator.serviceWorker
                    .register(pathRoot + "sw.js?location=" + pathRoot)
                    .then(() => log("Service Workers registered", true))
                    .catch((err) => log("Service worker registration failed: " + err, true));
            } else {
                log("Service Workers registration skipped", true);
            }
        }
        // ***
        if (!window.PlayerEnv) {
            log("Not In-Player environment", true)
            setTimeout(() => {
                window.BroadSignPlay();
            }, 5000);
        }
    });
}
