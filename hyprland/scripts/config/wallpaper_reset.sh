# Restart swww-daemon if not running
[ $(ps -C swww-daemon | wc -l) -lt 2 ] && swww-daemon
# Clear and set wallpaper to ensure it updates
sleep 1
swww clear
swww img -t none ~/documents/photos/wallpapers/current.png
