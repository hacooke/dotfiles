# CPU usage per core
cpu_usage=$(top -bn1 | grep "Cpu" | awk '{print $2}' | cut -d'%' -f1)
# Alternative for per-core (requires mpstat from sysstat package)
# cpu_cores=$(mpstat -P ALL 1 1 | awk '/Average:/ && $2 ~ /[0-9]/ {printf "CPU%s: %.0f%% ", $2, 100-$NF}')

# Memory usage
mem_info=$(free -h | awk '/^Mem:/ {printf "%s/%s", $3, $2}')

# Temperature (adjust path based on your system)
temp=$(cat /sys/class/hwmon/hwmon*/temp*_input 2>/dev/null | head -1 | awk '{printf "%.1f°C", $1/1000}')

# Disk usage
disk_usage=$(df -h / | awk 'NR==2 {printf "%s/%s (%s)", $3, $2, $5}')

echo "  ${cpu_usage}% |  ${temp} |   ${mem_info} | 󰋊 ${disk_usage}"
