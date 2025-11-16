#!/bin/bash
[ "$(pacmd list-sources | awk '/\* index/,/muted/' | tail -1 | awk '{print $2}')" == "yes" ] && echo " %{T10}%{T-} " || echo "  %{F#ff2817}%{T10}%{T-}%{F-}  "
