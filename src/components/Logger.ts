import { LoggerParameters } from "../utils/Interfaces";
export default class Logger {
    public logger: HTMLElement;
    public attributes: string[] = [];
    constructor(parameters: LoggerParameters) {
        this.logger = document.createElement("div");
        this.logger.id = parameters.identifier;
        this.attributes = parameters.attributes;
    }
    render() {
        if (this.attributes.length > 0) {
            this.attributes.forEach((attribute: string) => {
                this.logger.classList.add(attribute);
            })
        }
        const performance = document.createElement("div");
        performance.id = "performance";
        const performanceHeading = document.createElement("h2");
        performanceHeading.innerText = "Performance Log";
        const performanceList = document.createElement("ul");
        performance.appendChild(performanceHeading);
        performance.appendChild(performanceList);
        const responses = document.createElement("div");
        responses.id = "responses";
        const responsesHeading = document.createElement("h2");
        responsesHeading.innerText = "Details Log";
        const responsesList = document.createElement("ul");
        responses.appendChild(responsesHeading);
        responses.appendChild(responsesList);
        this.logger.appendChild(performance);
        this.logger.appendChild(responses);
        return this.logger;
    }
    show() {
        this.logger.classList.remove("hidden")
    }
    /*
    public record(msg: string = "", showInPlayer = false, target = "") {
        if (showInPlayer) {
            if (target != "") {
                console.log("Performance")
                const parameters: HTMLDivElement | null = this.logger.querySelector("#performance");
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
                console.log("Response")
                const responses = this.logger.querySelector("#responses");
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
            //console.log(msg);
        }
    }
    */
}
