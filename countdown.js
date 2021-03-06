/**
*   @class Countdown Object
*   @version 1.2
*   @description handles counting down from today's date to a date in future
*   @requires jQuery v1.3 or later
*   @author Michael Turnwall
*   
*   <p>Copyright (c) 2011 Michael Turnwall</p>
*   <p>Released under a GPLv3 license.</p>
*   <p>This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.</p>
*   
*   <p>This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.</p>
*   
*   <p>You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.</p>
*/
var Countdown = /** @lends Countdown.prototype */{
    /**
     *   find the difference in days, hours, mins, seconds between two dates.
     *   @param {Array} eventDate the date counting down to, [yyyy, m, d]
     *   the month is zero based so January is 0, December is 11.
     */
    getTimeDifference: function(eventDate) {
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
        if (eventDate.length < 4) {
            endDate = new Date(eventDate[0], eventDate[1], eventDate[2]);
        } else {
            endDate = new Date(eventDate[0], eventDate[1], eventDate[2], eventDate[3], eventDate[4]);
        }        
        startDate = new Date();
        
        /** subtract the event date with today's date minus the timezone difference */
        difference = endDate.getTime() - (startDate.getTime() - this.findTimezone());

        // Thanks to Richard Rudzinski for reminding me about modulus!
        // days
        if (difference >= oneDay) {
            this.timeValues['days'] = Math.floor(difference / oneDay);
        } else {
            this.timeValues['days'] = 0;
        }
        // hours
        this.timeValues['hours'] = Math.floor((difference % oneDay) / oneHour);
        // minutes
        this.timeValues['mins'] = Math.floor(((difference % oneDay) % oneHour) / oneMinute);
        // seconds
        this.timeValues['seconds'] = Math.ceil((((difference % oneDay) % oneHour) % oneMinute) / oneSecond);
    },
    /**
     *  handle just countdowning hours and minutes
     */
    startTimeCounter: function (eventDate) {
        var extraMins;
        this.getTimeDifference(eventDate);
        if (this.timeValues['hours']) {
            extraMins = this.timeValues['hours'] * 60;  // take any extra hours and add them to the total minutes
            this.timeValues['mins'] = this.timeValues['mins'] + extraMins;
        }
    },

    /**
     *   Find the current timezone the user's computer is in and then move it back to PDT
     *   @return {Integer} the total difference between current timezone and PDT in milliseconds
     */
    findTimezone: function() {
        var now, currentZone;

        now = new Date();
        currentZone = now.getTimezoneOffset();
        if (currentZone == this.pacificOffset) {
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
    countTime: function() {
        // temp variables so we have a copy to manipulate
        var days = this.timeValues['days'],
            hours = this.timeValues['hours'],
            mins = this.timeValues['mins'],
            secs = this.timeValues['seconds'],
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
        time = {
            days: (days >= 0) ? days : 0,
            hours: (hours >= 0) ? hours : 0,
            mins: (mins >= 0) ? mins : 0,
            seconds: (secs >= 0) ? secs : 0
        };
        /** write the new time values back to the main time array for next time */
        for (var i in time) {
            this.timeValues[i] = time[i];
        };
        this.writeTime(time);
    },

    /**
     *   write the new time values into the page
     */
    writeTime: function(values) {
        var obj = this;
        this.$_timeContainers.each(function(i) {
            var timeType = this.parentNode.className.match(/days|hours|mins|seconds/)[0];
            // add leading zero if needed
            if (values[timeType] >= 0) {
                (values[timeType].toString().length > 1) ? this.innerHTML = values[timeType] : this.innerHTML = '0' + values[timeType];
            }
        });
        // only continue countdown if all values aren't zero
        if (values['days'] != 0 || values['hours'] != 0 || values['mins'] != 0 || values['seconds'] != 0) {
            this.timer = window.setTimeout(function() {
                obj.countTime();
            }, 1000);
        } else {
            return window.location.reload();
        }
    },
    /** 
     *   initializes the object
     *   @param opts options for the object to initialize with
     *   @param {Array} opts.eventDate the date counting down to, [yyyy, m, d, hh, mm, ss]
     *       the month is zero based so January is 0, December is 11.
     *   @param {Boolean} opts.levelTimer true if the timer is used for a level timer instead of
             an upcoming event timer
     *   @param {Boolean} opts.dst whether or not daylight savings is currently in affect
     *   @param {String} opts.status a message to be displayed
     */
    init: function(opts) {
        this.$_timeContainers = $('.timerCont .timeValue span'); // HTML elements that hold the time values
        if (opts.eventStatus) {
            $('.timerCont').html(opts.eventStatus);
            return true;
        }
        this.timeValues = [];
        this.timer;     // setTimeout timer
        this.dst = (typeof opts.dst == 'undefined') ? false : opts.dst;
        this.pacificOffset = (this.dst) ? 420 : 480;    // find out if we have PST or PDT
        if (!opts.levelTimer) {
            this.getTimeDifference(opts.eventDate);  // find the difference between event date and today's date
        } else {
            this.startTimeCounter(opts.eventDate);
        }
        this.writeTime(this.timeValues);    // write the difference to the page and start countdown
    }
};