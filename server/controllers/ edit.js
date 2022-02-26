/*
TO CLEAR THOUGHTS

The saving system will work with the client only sending changes to the spoodaweb
All buds have an x,y position
All buds have a reference id

What if to render buds, if there are too many buds (e.g. 100 connected to the central bud), there can be layers, and you can connect buds across layers

for http request, bud has 2 types, subtract (sub) and addition (add), which are self explanatory. Sub requires a bud id to delete the bud.

example format below

{
    "spooderwebId": 1
    "spoodawebData": {
        "test": {
            "data": {
                "definition": "a test",
                "pronounciation": "pronounciation test",
                "contexts": [
                    "this is a context for testing",
                    "this is the second context"
                ],
                "examples": [
                    [
                        "does this link up with the context???",
                        "does this too?"
                    ],
                    [
                        "this should go to the second context"
                    ]
                ],
                "links": {
                    "1": 0.1,
                    "2": 1,
                    "3": 0.65
                }
            },
            "type": "add"
        }
    }
}

{
    "spoodawebData": {
        "test": {
            "data": {
                "id": 1
            },
            "type": "sub"
        }
    }
}
*/