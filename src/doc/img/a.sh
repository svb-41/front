ffmpeg -i bullet.mov -pix_fmt rgb8 -r 30 bullet.gif -ss 3 && gifsicle -O3 bullet.gif -o bullet.gif
ffmpeg -i bullets.mov -pix_fmt rgb8 -r 30 bullets.gif -ss 3 && gifsicle -O3 bullets.gif -o bullets.gif
ffmpeg -i thrust.mov -pix_fmt rgb8 -r 30 thrust.gif -ss 3 && gifsicle -O3 thrust.gif -o thrust.gif
ffmpeg -i torpedo.mov -pix_fmt rgb8 -r 30 torpedo.gif -ss 3 && gifsicle -O3 torpedo.gif -o torpedo.gif
ffmpeg -i turn.mov -pix_fmt rgb8 -r 30 turn.gif -ss 3 && gifsicle -O3 turn.gif -o turn.gif
ffmpeg -i turn2.mov -pix_fmt rgb8 -r 30 turn2.gif -ss 3 && gifsicle -O3 turn2.gif -o turn2.gif
ffmpeg -i radar.mov -pix_fmt rgb8 -r 30 radar.gif -ss 3 && gifsicle -O3 radar.gif -o radar.gif
