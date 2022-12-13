/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the JavaScript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */
var TSOS;
(function (TSOS) {
    class Queue {
        constructor(q = new Array()) {
            this.q = q;
        }
        getSize() {
            return this.q.length;
        }
        isEmpty() {
            return (this.q.length == 0);
        }
        enqueue(element) {
            this.q.push(element);
        }
        dequeue() {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }
        toString() {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }
        peekTail() {
            return this.q[this.q.length - 1];
        }
        extract(index) {
            var retVal = null;
            if (this.q[index] != undefined) {
                retVal = this.q[index];
                this.q.splice(index, 1);
            }
        }
    }
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=queue.js.map