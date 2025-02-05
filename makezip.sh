# Used by me on macOS to create a WebDesk zip installer
# DO NOT file a bug report or change for this
cd "/Users/user/webdesk-idb/desk" && rm -rf "../desk.zip" && zip -r "../desk.zip" "apps" "system" && \
    zip -d "../desk.zip" "__MACOSX/*" "*/.DS_Store" "*/__MACOSX"