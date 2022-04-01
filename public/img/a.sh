ffmpeg -y -i bullet.mov -pix_fmt rgb8 -r 30 bullet.gif -ss 3 && gifsicle -O3 bullet.gif -o bullet.gif
ffmpeg -y -i bullets.mov -pix_fmt rgb8 -r 30 bullets.gif -ss 3 && gifsicle -O3 bullets.gif -o bullets.gif
ffmpeg -y -i thrust.mov -pix_fmt rgb8 -r 30 thrust.gif -ss 3 && gifsicle -O3 thrust.gif -o thrust.gif
ffmpeg -y -i torpedo.mov -pix_fmt rgb8 -r 30 torpedo.gif -ss 3 && gifsicle -O3 torpedo.gif -o torpedo.gif
ffmpeg -y -i turn.mov -pix_fmt rgb8 -r 30 turn.gif -ss 3 && gifsicle -O3 turn.gif -o turn.gif
ffmpeg -y -i turn2.mov -pix_fmt rgb8 -r 30 turn2.gif -ss 3 && gifsicle -O3 turn2.gif -o turn2.gif
ffmpeg -y -i radar.mov -pix_fmt rgb8 -r 30 radar.gif -ss 3 && gifsicle -O3 radar.gif -o radar.gif
ffmpeg -y -i radar2.mov -pix_fmt rgb8 -r 30 radar2.gif -ss 3 && gifsicle -O3 radar2.gif -o radar2.gif
