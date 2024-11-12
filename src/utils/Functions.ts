export function log(msg: any = "", showInPlayer = false, target = "") {
    //if (window.ModeDebug) {
    const logger = document.getElementById("logger");
    if (showInPlayer) {
        if (target != "") {
            const parameters = logger?.querySelector("#performance");
            const targetList = parameters?.querySelector("ul");
            let targetItem = targetList?.querySelector(" #" + target);
            if (!targetItem) {
                targetItem = document.createElement("li");
                targetItem.setAttribute("id", target);
                targetItem.innerHTML = msg;
                targetList?.appendChild(targetItem);
            } else {
                targetItem.innerHTML = msg;
            }
        } else {
            const responses = logger?.querySelector("#responses");
            const targetList = responses?.querySelector("ul");
            if (targetList) {
                if (targetList?.innerHTML != "") {
                    targetList.innerHTML = targetList.innerHTML + "<li>" + msg + "</li>";
                } else {
                    targetList.innerHTML = "<li>" + msg + "</li>";
                }
            }
        }
    } else {
        console.log(msg);
    }
    //}
}
export function mode(name: string) {
    let mode: string = getParameter("mode");
    if (mode == "") {
        mode = window.BroadSignObject["mode"] || "";
    }
    const isDegugMode: boolean = (mode == name);
    return (isDegugMode);
}
export function action(name: string) {
    let action: string = getParameter("action");
    if (action == "") {
        action = window.BroadSignObject["action"] || "";
    }
    const takeAction: boolean = (action == name);
    return (takeAction);
}
function getParameter(name: string): string {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const value: string = urlSearchParams.get(name) as string;
    return value;
}
export function percentage(percent: number, number: number) {
    const percentageResult = Math.floor((percent / 100) * number);
    log("Percentage: " + percentageResult + "%")
    return percentageResult
}
export function progress(number: number, total: number) {
    const proportionResult = Math.floor(Math.floor(number) * 100 / total);
    log("Current video progress: " + proportionResult + "%", true, "playback")
    return proportionResult;
}