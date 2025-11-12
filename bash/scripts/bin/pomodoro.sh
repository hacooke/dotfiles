#!/bin/bash
timer() {
    #$1 is start time
    start_time=$1
    end_time=`expr $start_time + 25 \* 60`
    while sleep .1s; do
        current_time=`date +%s`
        seconds_left=`expr $end_time - $current_time`
        if [ $seconds_left -lt 0 ]; then
            # do something
            #printf "00:00\r"
            break
        else
            secs=`expr $seconds_left % 60`
            mins=`expr $(expr $seconds_left - $secs) / 60`
            printf "\e[32;1m%02d:%02d\e[0m\r" $mins $secs
        fi
    done
}

session_start() {
    # print tasks
    task list

    # choose task
    echo "Enter task ID to assign to this session.\nOtherwise\
          enter a label for this session."
    #>get input

    # start timewarrior session

    # start timer
    timer $(date +%s)
}

echo "type 's' to start a session"

#>look for input
