const DateDisplayType = {
    ISO : "ISO",
    MIXED : "MIXED",
    VAR : "format.dateDisplayType",
};

class DocumentDate {
    static getDateDisplayType() {
        let storedValue = window.localStorage.getItem(DateDisplayType.VAR);
        switch (storedValue) {
            case DateDisplayType.MIXED:
                return DateDisplayType.MIXED;
            default:
                return DateDisplayType.ISO;
        }
    }

    static nextDateDisplayType(displayType) {
        switch (displayType) {
            case DateDisplayType.ISO:
                return DateDisplayType.MIXED;
            default:
                return DateDisplayType.ISO;
        }
    }

    static toggleDateDisplayType() {
        const storedType = DocumentDate.getDateDisplayType();
        const nextType = DocumentDate.nextDateDisplayType(storedType);
        window.localStorage.setItem(DateDisplayType.VAR, nextType);

        return nextType;
    }

    static toggleDateDisplayTypeAndReplace() {
        DocumentDate.toggleDateDisplayType();
        DocumentDate.replaceDates();
    }

    static getDisplayAgeFromMilliSeconds(now, date) {
        let result = date.toISOString();
        if (DocumentDate.getDateDisplayType() === DateDisplayType.ISO) {
            return result.replace(/:[0-9]{2}\.[0-9]{3}Z$/,"");
        }
        let year = date.getFullYear();
        let yearDiff = now.getFullYear() - year;
        let month = date.getMonth();
        let monthDiff = now.getMonth() - month;
        let day = date.getDay();
        let dayDiff = now.getDay() - day;

        if (yearDiff === 0 && monthDiff === 0 && dayDiff === 0) {
            let minutes = Math.round((now.getTime() - date.getTime()) / 60000);
            let hours = minutes / 600;
            minutes -= 60 * hours;
            result = "";
            if (hours > 0) {
                result += hours;
                result += 'h';
            }
            result += minutes;
            result += "m";
            return result;
        }

        result = result.replace(/:[0-9]{2}\.[0-9]{3}Z$/,"");
        if (yearDiff === 0) {
            result = result.replace(/^[0-9]{4}-/, "");
        }
        if (yearDiff > 0 || monthDiff > 0) {
            result = result.replace(/T[0-9]{2}:[0-9]{2}$/,"");
        }

        return result;
    }



    static getElementDate(element) {
        if (typeof(element.emmefStamp) === "number") {
            return new Date(element.emmefStamp);
        }
        let stampText = element.innerText;
        let stamp = 1 * stampText;
        let stampText2 = "" + stamp;
        let number = stampText !== stampText2 ? null : stamp;
        if (number !== null) {
            element.emmefStamp = stamp;
            return new Date(number);
        }
        return null;
    }

    static replaceDates() {
        let list = document.body.getElementsByClassName("milliseconds-age");
        const now = new Date();
        for (let element of list) {
            let date = DocumentDate.getElementDate(element);
            if (date !== null) {
                element.innerHTML = DocumentDate.getDisplayAgeFromMilliSeconds(now, date);
            }
        }
    }
}

class EmmefUtil {
    constructor() {
        this.youtubeFrames = undefined;
        this.articles = undefined;
        this.relativeEmbeddedFrameMargin = 0.1;
    }

    static init() {
        EmmefUtil.resizeEmbeddedFrames();
        for (let element of document.getElementsByClassName("milliseconds-age")) {
            element.addEventListener("click", DocumentDate.toggleDateDisplayTypeAndReplace);
            window.console.log("Du Ya");
        }
        let replaceDataThread = function() {
            DocumentDate.replaceDates();
            window.setTimeout(replaceDataThread, 10000);
        };
        replaceDataThread();
    }

    static resizeEmbeddedFrames() {
        let articles = document.body.getElementsByTagName("article");
        let youtubeFrames = document.body.getElementsByClassName("youtube-frame");
        try {
            if (articles && youtubeFrames && articles.length > 0 && youtubeFrames.length > 0) {
                this.articles = articles;
                this.youtubeFrames = youtubeFrames;
                let relativeMargin = getComputedStyle(document.body).getPropertyValue("--embedded-frame-margin");
                if (relativeMargin && !isNaN(parseFloat(relativeMargin))) {
                    this.relativeEmbeddedFrameMargin = Math.min(0.2, Math.max(0.01, parseFloat(relativeMargin)));
                }
                else {
                    this.relativeEmbeddedFrameMargin = 0.1;
                }
                window.console.info(relativeMargin);
                this.resizeYoutubeFrames();
                window.addEventListener("resize", function () {this.resizeYoutubeFrames();});
            }
        }
        catch (e) {
            window.console.error("Could not establish if there are elements to resize", e.toString());
        }
    }

    static resizeYoutubeFrames() {
        if (EmmefUtil.articles && EmmefUtil.youtubeFrames) {
            let articleWidth = 0;
            for (let article of EmmefUtil.articles) {
                articleWidth = Math.max(articleWidth, article.offsetWidth);
            }
            let margin = EmmefUtil.relativeEmbeddedFrameMargin * articleWidth;
            let frameWidth = articleWidth - 2 * margin;
            let frameHeight = 429 * frameWidth / 763;
            for (let frame of EmmefUtil.youtubeFrames) {
                frame.style.width = "" + frameWidth + "px";
                frame.style.height = "" + frameHeight + "px";
                frame.style.marginLeft = "" + margin + "px";
            }
        }
    }
}
