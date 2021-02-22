const MorseDecodingStream = require('../index.js')

const fs = require('fs')
const wav = require('wav')

const morse = require('morse-node').create("ITU");

const file = fs.createReadStream('artifacts/morse.i_love_you.wav')

const reader = new wav.Reader()

var acc_a = ""
var acc_b = ""
 
reader.on('format', function (format) {
    //console.log(format)

    const opts = {
        threshold: 0.1,
        numSamples: 10,
        dotDuration: 65, 
    }

    const mds = new MorseDecodingStream(format, opts)

    mds.on("data", data => {
        if(data == '/') {
            acc_a += " / "
            acc_b += " "
        } else if(data == ' ') {
            acc_a += " "
        } else {
            acc_a += data
            acc_b += morse.decode(data).trim().toUpperCase()
        }
    })

    mds.on("end", () => {
        console.log()
        console.log(`morse   : ${acc_a}`)
        console.log(`decoded : ${acc_b}`)
    })

    reader.pipe(mds)
})

reader.on('error', error => {
    console.error(error)
})

file.pipe(reader)

