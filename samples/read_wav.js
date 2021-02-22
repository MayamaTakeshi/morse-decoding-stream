const MorseDecodingStream = require('../index.js')

const fs = require('fs')
const wav = require('wav')

const morse = require('morse-node').create("ITU")

const args = require('yargs').argv

const usage = () => {
    console.log(`
Usage:     node ${args.$0} wav_file num_samples threshold dot_duration

Ex:        node ${args.$0} morse.wav 10 0.1 65

Details:
           wav_file: audio file containing morse code (you can find some mp3 files here: http://www.arrl.org/code-practice-files But you will need to convert them to wav)
           num_saples: number of samples to use to identify signal ON/OFF
           threshold: threshold for signal detection
           dot_duration: approximate duration of dot signal
`)
}

if(args._.length != 4) {
    console.error("Invalid number of arguments")
    usage()
    process.exit(1)
}           

const wav_file = args._[0]
const num_samples = parseInt(args._[1])
const threshold = parseFloat(args._[2])
const dotDuration = parseInt(args._[3])

const file = fs.createReadStream(wav_file)
const reader = new wav.Reader()

var acc_a = ""
var acc_b = ""
 
reader.on('format', function (format) {
    console.log(format)

    const opts = {
        threshold: threshold,
        numSamples: num_samples,
        dotDuration: dotDuration,
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

