import './style.css'
import Slide from './components/Slide';
import WebcamFeed from './components/WebcamFeed';
import Logger from './components/Logger';
import { SlideVideoParameters, SlideOverlayParameters } from './utils/Interfaces';
import { log, mode, action } from './utils/Functions'
declare global {
    interface Window {
        BroadSignPlay: () => boolean;
        ModeDebug: boolean;
        PlayerEnv: boolean;
        BroadSignObject: any;
        ActionClearCache: boolean;
    }
}
const app = document.querySelector<HTMLDivElement>('#app');
//window.BroadSignObject = { mode:"debug", action:"clear-cache" };
document.addEventListener('DOMContentLoaded', () => {
    if (app) {
        window.BroadSignObject = window.BroadSignObject || {};
        window.PlayerEnv = (Object.keys(window.BroadSignObject).length > 1) ? true : false;
        window.ModeDebug = mode("debug");
        window.ActionClearCache = action("clear-cache");
        const visibility: string = (window.ModeDebug) ? "visible" : "hidden";
        const webcam = new WebcamFeed({ identifier: "viewer", attributes: [visibility] });
        const slide01VideoParameters: SlideVideoParameters = { identifier: "slide01", source: "cta.mp4", attributes: ["muted", "loop", "autoplay"] };
        const slide01OverlayParameters: SlideOverlayParameters = { heading: "Slide 1", description: "Call to Action", withProgress: true, status: visibility };
        const slide01 = new Slide({ identifier: "slide01", videoParameters: slide01VideoParameters, overlayParameters: slide01OverlayParameters, status: "" });
        const slide02VideoParameters: SlideVideoParameters = { identifier: "slide02", source: "reaction.mp4", attributes: ["muted"] };
        const slide02OverlayParameters: SlideOverlayParameters = { heading: "Slide 2", description: "Face Recognized", withProgress: true, status: visibility };
        const slide02 = new Slide({ identifier: "slide02", videoParameters: slide02VideoParameters, overlayParameters: slide02OverlayParameters, status: "hidden" });
        const logger = new Logger({ identifier: "logger", attributes: [visibility] });
        app.appendChild(webcam.render());
        app.appendChild(slide01.render());
        app.appendChild(slide02.render());
        app.appendChild(logger.render());
        window.BroadSignPlay = () => {
            log("BS > BroadSignPlay() function executed", true);
            webcam.startDetection();
            return true;
        }
        webcam.initializeDetector();
        const path = window.location.hostname;
        const isRemote = path.includes("ccplay");
        const isPlayer = path.includes("file");
        let pathRoot = (isRemote) ? "/test/facedetection/" : "/dist/";
        pathRoot = (isPlayer) ? "./" : pathRoot;
        if (window.PlayerEnv) {
            log("BS > In-Player environment", true)
            if (window.BroadSignObject["mode"]) {
                log("BS > mode = " + window.BroadSignObject["mode"], true);
            }
            if (window.BroadSignObject["action"]) {
                log("BS > action = " + window.BroadSignObject["action"], true);
            }
            /*for (var property in window.BroadSignObject) {
                log("BS > " + property + " = " + window.BroadSignObject[property], true);
            };*/
        } else {
            log("BS > Not In-Player environment", true)
            setTimeout(() => {
                window.BroadSignPlay();
            }, 5000);
        }

        // *** Cache Control
        if (window.ActionClearCache) {
            log("SW > Searching for active service workers", true)
            window.ActionClearCache = true;
            setTimeout(() => {
                navigator.serviceWorker.getRegistration(pathRoot + 'sw.js').then((registration) => {
                    log("SW > Service worker found", true);
                    registration?.unregister().then(function () {
                        log('SW > Service worker unregistered successfully', true);
                        caches.keys().then(function (cacheNames) {
                            return Promise.all(
                                cacheNames.map(function (cacheName) {
                                    log("SW > Cache cleared", true);
                                    return caches.delete(cacheName);
                                })
                            );
                        });
                    }).catch(function (error) {
                        console.error('SW > Error unregistering service worker:', error);
                    });
                });
            }, 2000);
        } else {
            if ((isRemote || window.ModeDebug) && "serviceWorker" in navigator) {
                navigator.serviceWorker
                    .register(pathRoot + "sw.js")
                    .then(() => log("SW > Service Workers registered", true))
                    .catch((err) => log("SW > Service worker registration failed: " + err, true));
            } else {
                log("SW > Service Workers registration skipped", true);
            }
        }
    }
});
