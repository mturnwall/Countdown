/**
*   @class Countdown Object
*   @version 1.0
*   @description handles counting down from today's date to a date in future
*   @requires jQuery v1.3 or later
*   @author Michael Turnwall - Digitaria, Inc.
*	<p>Licensed under a MIT license:
*	http://www.opensource.org/licenses/mit-license.php
*	<br />
*	Copyright (c) 2011 Digitaria, Inc. (http://digitaria.com/)</p>
*/
var Countdown = /** @lends Countdown.prototype */ {
    /** 
	*   initializes the object
	*   @param {Array} eventDate the date counting down to, [yyyy, m, d]
    *       the month is zero based so January is 0, December is 11.
	*   @constructs
	*/
    init: function (eventDate) {
        var obj = this;
        this.$_timeContainers = $('.timerCont .timeValue span'); // HTML elements that hold the time values
        this.timeValues = [];
        this.timer;     // setTimeout timer
        this.pacificOffset = 420;
        
        this.getTimeDifference(eventDate);  // find the difference between event date and today's date
        this.writeTime(this.timeValues);    // write the difference to the page and start countdown
    },

    /**
    *   find the difference in days, hours, mins, seconds between two dates.
    *   @param {Array} eventDate the date counting down to, [yyyy, m, d]
    *   the month is zero based so January is 0, December is 11.
    */
    getTimeDifference: function (eventDate) {
        var difference,
            endDate,
            oneDay,
            oneHour,
            oneMinute,
            oneSecond,
            startDate,
            values;
        
        values = [];
        oneDay = 1000 * 60 * 60 * 24;
        oneHour = 1000 * 60 * 60;
        oneMinute = 1000 * 60;
        oneSecond = 1000;
        endDate = new Date(eventDate[0], eventDate[1], eventDate[2]);
        startDate = new Date();
        
        /** subtract the event date with today's date minus the timezone difference */
        difference = endDate.getTime() - (startDate.getTime() - this.findTimezone());

        // Thanks to Richard Rudzinski for reminding me about modulus!
        // days
        this.timeValues.push(Math.ceil(difference / oneDay));
        // hours
        this.timeValues.push(Math.ceil((difference % oneDay) / oneHour));
        // minutes
        this.timeValues.push(Math.ceil(((difference % oneDay) % oneHour) / oneMinute));
        // seconds
        this.timeValues.push(Math.ceil((((difference % oneDay) % oneHour) % oneMinute) / oneSecond));
    },
    
    /**
    *   Find the current timezone the user's computer is in and then move it back to PDT
    *   @return {Integer} the total difference between current timezone and PDT in milliseconds
    */
    findTimezone: function () {
        var now, currentZone;
        
        now = new Date();
        currentZone = now.getTimezoneOffset();
        if (currentZone == 420) {
            return 0;
        }
        if (currentZone < 0) {
            currentZone = (currentZone * -1) + this.pacificOffset;
        } else if (currentZone < this.pacificOffset) {
            currentZone = this.pacificOffset - currentZone;
        } else {
            currentZone = this.pacificOffset + currentZone;
        }
        
        return currentZone * 1000 * 60;
    },
    
    /**
    *   take current time value and deduct a second
    */
    countTime: function () {
        // temp variables so we have a copy to manipulate
        var days = this.timeValues[0],
        hours = this.timeValues[1],
        mins = this.timeValues[2],
        secs = this.timeValues[3],
        time;
        if (secs > 0) {
            secs--;
        } else if (secs == 0 && mins > 0) {
            secs = 59;
            mins--;
        } else if (secs == 0 && mins == 0 && hours > 0) {
            if (mins == 0 && hours > 0) {
                secs = 59;
                mins = 59;
            }
            if (hours > 1) {
                hours--;
            } else if (hours == 1 && days > 0) {
                hours = 0;  // it is possile to have 1 day 00 hours 59 mins
                days--;
            } else {
                hours = 0;
            }
        }
        time = [days, hours, mins, secs];
        /** write the new time values back to the main time array for next time */
        for (var i = time.length - 1; i >= 0; i--){
            this.timeValues[i] = time[i];
        };
        this.writeTime(time);
    },
    
    /**
    *   write the new time values into the page
    */
    writeTime: function (values) {
        var obj = this;
        this.$_timeContainers.each(function (i) {
            // add leading zero if needed
            (values[i].toString().length > 1) ? this.innerHTML = values[i] : this.innerHTML = '0' + values[i];
        });
        // only continue countdown if all values aren't zero
        if (values[0] !=0 || values[1] !=0 || values[2] !=0 || values[3] !=0) {
            this.timer = window.setTimeout(function () {
                obj.countTime();
            }, 1000);
        } else {
            return 'Lets shuffle and deal!';
        }
    }
};