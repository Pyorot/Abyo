// Prototype-extending date utilities
Date.prototype.hhmmssmmm = function() {return this.toTimeString().slice(0,8) + '.' + String(this.getMilliseconds()).padStart(3,'0')}
   Date.prototype.hhmmss = function() {return this.toTimeString().slice(0,8)}
     Date.prototype.mmss = function() {return this.toTimeString().slice(3,8)}
       Date.prototype.ss = function() {return this.toTimeString().slice(6,8)}

Date.prototype.full = function() {return this.toDateString() + ' ' + this.toTimeString().slice(0,8)}

Date.prototype.number = function() {return this.getTime()/1000}
Number.prototype.date = function() {return new Date(this*1000)}