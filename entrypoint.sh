#!/bin/sh

# replace /__ENTRYPOINT__ with the runtime-configured entrypoint
escaped_frame_urls=$(echo "$ALLOWED_FRAME_URLS" | sed 's/\//\\\//g')

echo "Replacing /__ENTRYPOINT__ in all .next file..."
find .next -type f -exec sed -i 's/\/__ENTRYPOINT__/'"${escaped_frame_urls}"'/g' {} +

# Check if any replacements were made in .next files
if [ $? -eq 0 ]; then
  echo "Replacements in .next completed."
else
  echo "No replacements made in .next or an error occurred."
fi

# Replace /__ENTRYPOINT__ in server.js
echo "Replacing /__ENTRYPOINT__ in server.js..."
sed -i "s/\/__ENTRYPOINT__/${escaped_frame_urls}/g" server.js

# Check if any replacements were made in server.js
if [ $? -eq 0 ]; then
  echo "Replacements in server.js completed."
else
  echo "No replacements made in server.js or an error occurred."
fi

$@