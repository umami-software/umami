### how to update

1. find missing keys:

```sh
MINE=<your-lang>.json
BASE=en-US.json

jq 'keys' < $BASE > base
jq 'keys' < $MINE > mine

diff -c2 base mine
# will print missing keys.
# add them to $MINE
```

2. for each key, search in your editor where it is used, and additionally visit the [live demo website](https://app.umami.is/share/8rmHaheU/umami.is), to better understand the usage context.

3. translate. though, if you don't fully understand the context of how a translation is used, note this in the PR review.
