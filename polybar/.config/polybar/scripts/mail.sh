#!/bin/sh

if (( $(ls -1 ~/Mail/cern/Inbox/new | wc -l) > 0 ))
then
    echo "   %{F#ff2817}%{T5}%{T-}%{F-}   "
elif (( $(ls -1 ~/Mail/aol/Inbox/new | wc -l) > 0 ))
then 
    echo "   %{F#fffcf5}%{T5}%{T-}%{F-}   "
    #echo "   %{T5}%{T-}   "
else
    echo "no mail"
fi

