# Cross-Space Reference UI Extension

> This is for the moment internal only, we're refining it to make it public.

## Installation

```
npm install && npm run configure
```

This will install all dependencies, setup the Contentful CLI with your desired target space and target environment.

## Configuring your space

Once the dependencies are installed, you need to install the extension in your space.

This will happen when you start running this package in development mode:

```
curl -X POST \
  -H'Content-Type: application/json' \
  -H'Authorization: Bearer YOUR-CMA-TOKEN-GOES-HERE' \
  -d'{"name": "Cross Space Configuration", "src": "http://localhost:1234", "locations": ["app", "entry-field"], "fieldTypes: [{"type": "Object"}]}' \
  https://api.contentful.com/organizations/YOUR-ORG-ID-GOES-HERE/app_definitions
```

Then create a new JSON field in any Content Type in your space, and select the `Cross Space Reference` appearance.

## LICENSE

MIT
