class TimeUnit {
    constructor(name, units) {
        this.name = name;
        this.units = units;
    }

    times(name, units) {
        return new TimeUnit(name, Math.round(this.units * units));
    }
}


TimeUnit.MILLISECONDS = new TimeUnit("msec", 1);
TimeUnit.SECOND = TimeUnit.MILLISECONDS.times("s", 1000);
TimeUnit.MINUTE = TimeUnit.SECOND.times("m", 60);
TimeUnit.HOUR = TimeUnit.MINUTE.times("h", 60);
TimeUnit.DAY = TimeUnit.HOUR.times("d", 24);
TimeUnit.WEEK = TimeUnit.DAY.times("w", 7);
TimeUnit.MONTH = TimeUnit.DAY.times("m", 30.438);
TimeUnit.YEAR = TimeUnit.DAY.times("y", 365.254);
TimeUnit.UNITS = [ TimeUnit.YEAR, TimeUnit.MONTH, TimeUnit.WEEK, TimeUnit.DAY, TimeUnit.HOUR, TimeUnit.MINUTE, TimeUnit.SECOND];

TimeUnit.getDisplayAgeFromMilliSeconds = function(num,smallestUnit=TimeUnit.MINUTE) {
    let rounded = Math.round(num);
    let smallestUnitIndex = TimeUnit.UNITS.indexOf(smallestUnit);
    let length = smallestUnitIndex >= 0 ? smallestUnitIndex + 1: TimeUnit.UNITS.length;
    for (let i = 0; i < length; i++) {
        let unit = TimeUnit.UNITS[i];
        if (unit.units <= rounded) {
            let numerator = Math.floor(rounded / unit.units);
            let result = "" + numerator + unit.name;
            if (i < length - 1) {
                let remainder = rounded % unit.units;
                let subUnit = TimeUnit.UNITS[i + 1];
                let denominator = Math.floor(remainder / subUnit.units);
                if (denominator < 1) {
                    return result;
                }
                return result + denominator + subUnit.name;
            }
            return result;
        }
    }
    return "0" + TimeUnit.UNITS[length - 1].name;
}

class EmmefUtil {

    static init() {
        let replaceDataThread = function() {
            EmmefUtil.replaceDates();
            window.setTimeout(replaceDataThread, 10000);
        }
        replaceDataThread();
    }

    static replaceDates() {
        let list = document.body.getElementsByClassName("milliseconds-age");

        for (let element of list) {
            let seconds = EmmefUtil.getAgeInSeconds(element);
            if (seconds != null) {
                let display = TimeUnit.getDisplayAgeFromMilliSeconds(seconds)
                element.innerHTML = display;
            }
        }
    }

    static getAgeInSeconds(element) {
        let number = 0;
        if (typeof(element.emmefStamp) == "number") {
            number = element.emmefStamp;
        }
        else {
            let stampText = element.innerText;
            let stamp = 1 * stampText;
            number = stamp != stampText ? null : stamp;
            element.emmefStamp = number;
        }

        return number != null ? Date.now() - number : null;
    }
}

// EmmefUtil = new EmmefUtilClass();


