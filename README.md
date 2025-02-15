# virginia

read stuff

## development

1. `npm i`
1. `npm run dev`

## release

1. create a `.env` file in the root directory specifying:

```
APPLE_SIGNING_IDENTITY= # Identity
APPLE_API_ISSUER= # Issuer ID
APPLE_API_KEY= # Key ID
APPLE_API_KEY_PATH= # Path to key file
```

2. upgrade the version in `package.json`
1. `npm run release`
1. upload the release to github releases manually
