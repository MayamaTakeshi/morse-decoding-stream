const { Writable } = require('stream')
const { EventEmitter } = require('events')

const SignalDetectionStream = require('signal-detection-stream')

class MorseDecodingStream extends Writable {
	constructor(format, opts) {
		super()

        this.dot_duration = opts.dotDuration
        this.dash_duration = opts.dotDuration * 3
        this.word_space_duration = opts.dotDuration * 7

		this.eventEmitter = new EventEmitter()

        this.sds = new SignalDetectionStream(format, opts)

        this.acc = []

        this.last_signal_time = new Date()

        this.sds.on('signal', data => {
            this.last_signal_time = new Date()

            if(data.end) {
                console.log(`sds.on signal ${JSON.stringify(data)}`)
                // process extinction
                var diff = data.end - data.start
                //console.log(`diff=${diff}`)
                if(data.on) {
                    if(diff > this.word_space_duration) {
                        console.log("Unexpected long word space signal")
                    } else if(diff > this.dash_duration) {
                        this.acc.push("-")
                    } else {
                        this.acc.push(".")
                    }
                } else {
                    if(diff > this.word_space_duration) {
                        if(this.acc.length > 0) {
                            this.eventEmitter.emit('data', this.acc.join(""))
                            this.acc = []
                        }
                        this.eventEmitter.emit('data', '/')
                    } else if(diff > this.dash_duration) {
                        if(this.acc.length > 0) {
                            this.eventEmitter.emit('data', this.acc.join(""))
                            this.acc = []
                        }
                        this.eventEmitter.emit('data', ' ')
                    }
                }
                console.log(this.acc)
            }
        })

        this.timer_id = setInterval(() => {
            var now = new Date()
            var diff = now.getTime() - this.last_signal_time.getTime()
            if(this.acc.length > 0 && diff > (this.word_space_duration * 2)) {
                // flush acc
                this.eventEmitter.emit('data', this.acc.join(""))
                this.acc = []
            }
        }, 100)
	}

	on(evt, cb) {
        if(evt == 'data' || evt == 'end') {
		    this.eventEmitter.on(evt, cb)
        } else {
            super.on(evt, cb)
        }
	}

	_write(chunk, encoding, callback) {
		//console.log('_write', chunk)
        var res = this.sds._write(chunk, encoding, callback)
	}

    _final() {
        if(this.acc.length > 0) {
            this.eventEmitter.emit('data', this.acc.join(""))
        }

        if(this.timer_id) {
            clearInterval(this.timer_id)
        }

        this.eventEmitter.emit('end')
    }
}

module.exports = MorseDecodingStream

