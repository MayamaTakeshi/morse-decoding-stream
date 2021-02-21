# morse-decoding-stream

## Overview

This is a quick and dirty morse decoding stream that I wrote to use to provide language='morse' to https://github.com/MayamaTakeshi/mrcp_server

It doesn't do any adaptation for speed and requires you to specify the approximate duration of a dot.

## Installation
```
npm install morse-decoding-stream
```

## Sample
You can try the sample:
```
$ node samples/i_love_you.js 

morse   : .. / .-.. --- ...- . / -.-- --- ..-
decoded : I / LOVE / YOU

```

## Disclaimer

The file artifacts/morse.i_love_you.wav was obtained by converting
https://commons.wikimedia.org/wiki/File:I_love_you_morse_code.ogg
from ogg to wav.

