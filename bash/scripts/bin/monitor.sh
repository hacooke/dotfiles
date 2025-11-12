#!/bin/bash

function SetMonOn {
	[ `cat ~/.externalmonitor_direction.txt` = "right" ] && xrandr --output DP1 --auto --right-of eDP1 || xrandr --output DP1 --auto --left-of eDP1
}

SetMonOn
#xrandr --output DP1 --auto --right-of eDP1
#xrandr --output DP1 --off

# default monitor is DP1
export MONITOR=DP1

# Update i3 after monitor change
function i3Update {
    # update polybars
    ~/.config/polybar/launch.sh > /dev/null 2>&1
    # update wallpaper (TODO remove redundancy in specifying wallpaper)
    #wpg -s eventdisplay-cubism.png > /dev/null 2>&1
    #wpg seems to be broken, use feh for now
    feh --bg-fill ~/Pictures/desktop-photos/eventdisplay-cubism.png
}

i3Update


# functions to switch from eDP1 to DP1 and vice versa
function ActivateExternal {
	echo "Extending to external"
    SetMonOn
    i3Update
	export MONITOR=DP1
}
function DeactivateExternal {
	echo "Switching to laptop display"
	xrandr --output DP1 --off
    i3Update
	export MONITOR=eDP1
}

# functions to check if DP1 is connected and in use
function ExternalActive {
	[ $MONITOR = "DP1" ]
}
function ExternalConnected {
	! xrandr | grep "^DP1" | grep disconnected > /dev/null 2>&1
}

function ExternalDisabled {
    [ `cat ~/.externalmonitor.txt` = "off" ]
}

if ExternalDisabled; then echo "it's disabled"; fi
if ExternalActive; then echo "it's on"; fi
echo "here"

# actual script
while true
do
	if ! ExternalActive && ExternalConnected && ! ExternalDisabled
	then
		ActivateExternal
	fi

    if ExternalActive && (! ExternalConnected || ExternalDisabled)
	then
		DeactivateExternal
	fi

	sleep 1s
done
